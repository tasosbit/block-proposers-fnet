import { Database, Statement } from "duckdb-async";

async function getClient(): Promise<Database> {
  const db = await Database.create("data/db.duckdb");
  await db.exec("PRAGMA force_compression='auto'");
  return db;
}

async function createDB(db: Database) {
  console.warn("creating db");
  await db.exec("CREATE TABLE proposers(rnd INTEGER PRIMARY KEY, proposer VARCHAR)");
  // await db.exec("CREATE TABLE state(key VARCHAR PRIMARY KEY, type VARCHAR, value VARCHAR)");
  // await db.exec("INSERT INTO state VALUES ('lastRound', 'number', '1');");
}

let db: Database
export async function getOrCreateDB(): Promise<Database> {
  if (db) {
    return db;
  }
  try {
    db = await getClient();
    await db.all("select 1");
  } catch(e) {
    console.error("DB Error", e);
    throw e;
  }
  try {
    await db.all("select 1 from proposers limit 1");
    return db;
  } catch(e) {
    console.warn("db not initialized");
  }
  await createDB(db);
  return db;
}

export async function getLastRound(db: Database): Promise<number> {
  const rows = await db.all("SELECT max(rnd) from proposers");
  return rows[0]["max(rnd)"] ?? 0;
}

let insertCons: Record<string, Statement> = {};
type ProposerTuple = [number, string];
export async function insertProposers(db: Database, ...values: ProposerTuple[]): Promise<void> {
  const num = values.length;
  if (!(num in insertCons)) {
    const qs = new Array(num).fill("(?, ?)").join(", ");
    const query = "INSERT INTO proposers VALUES " + qs
    insertCon = await db.prepare(query);
  }
  const dbValues = values.flat();
  await insertCon.run(...dbValues);
  let logLine = dbValues.map(s => String(s).slice(0, 8)).join(" ").slice(0, 80);
  console.log("INSERT", `(${values.length})`, values[0][0], values[num-1][0], logLine);
}

let insertCon: Statement;
export async function insertProposer(db: Database, rnd: number, prop: string): Promise<void> {
  if (!insertCon) {
    insertCon = await db.prepare("INSERT INTO proposers VALUES (?, ?)");
  }
  await insertCon.run(rnd, prop);
  console.log("INSERT", rnd, prop.slice(0, 8));
}

export interface ProposerCount {
  proposer: string;
  blocks: number;
}

export async function getAllProposerCounts(db: Database, minRnd = 0, maxRnd = Infinity): Promise<ProposerCount[]> {
  const rows = await db.all('select proposer, count(rnd) as blocks from proposers where rnd >= ? and rnd <= ? group by proposer order by blocks desc', minRnd, maxRnd);
  return rows as ProposerCount[];
}

export async function getProposerBlocks(db: Database, proposer: string, minRnd = 0, maxRnd = Infinity): Promise<number[]> {
  const rows = await db.all('select rnd from proposers where proposer = ? and rnd >= ? and rnd <= ?', proposer, minRnd, maxRnd);
  return rows.map(({rnd}) => rnd);
}

export async function getMaxRound(db: Database): Promise<number> {
  const rows = await db.all('select max(rnd) as max from proposers');
  return rows[0].max;
}

export async function countRecords(db: Database): Promise<number> {
  const rows = await db.all('select count(*) as count from proposers');
  return Number(rows[0].count);
}

export async function getRoundExists(db: Database, rnd: number): Promise<boolean> {
  const rows = await db.all('select rnd from proposers where rnd = ?', rnd);
  return !!rows[0];
}

process.on('SIGINT', async function() {
  console.log("Closing DB");
  await db.close();
  console.log("OK");
  process.exit(0);
});
