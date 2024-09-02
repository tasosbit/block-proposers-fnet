import { Database, Statement } from "duckdb-async";
import { unique } from './utils.js';
import { VOTE_ROUNDS_THRESHOLD } from './config.js';

async function getClient(name: string): Promise<Database> {
  const db = await Database.create(`data/${name}.duckdb`);
  await db.exec("PRAGMA force_compression='auto'");
  return db;
}

async function createDB(db: Database) {
  console.warn("creating db");
  await db.exec("CREATE TABLE proposers(rnd UINT64 PRIMARY KEY, proposer VARCHAR, payout UINT64)");
  await db.exec("CREATE TABLE voters(rnd UINT64, voter VARCHAR)");
}

let db: Database
export async function getOrCreateDB(name: string): Promise<Database> {
  if (db) {
    return db;
  }
  try {
    db = await getClient(name);
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
  if (rows[0])
    return Number(rows[0]["max(rnd)"]);
  return 0;
}

let insertCons: Record<string, Statement> = {};
type ProposerTuple = [number, string, number];
export async function insertProposers(db: Database, ...values: ProposerTuple[]): Promise<void> {
  const num = values.length;
  if (!(num in insertCons)) {
    const qs = new Array(num).fill("(?, ?, ?)").join(", ");
    const query = "INSERT INTO proposers VALUES " + qs
    insertCons[num] = await db.prepare(query);
    console.warn("Making new insertProposers query", num);
  }
  const dbValues = values.flat();
  await insertCons[num].run(...dbValues);
  let logLine = dbValues.map(s => String(s).slice(0, 8)).join(" ").slice(0, 80);
  console.log("INSERT proposers", `(${values.length})`, values[0][0], values[num-1][0], logLine);
}

export async function insertProposer(db: Database, rnd: number, prop: string, pay: number): Promise<void> {
  return insertProposers(db, [rnd, prop, pay]);
}

let delStatement: Statement;
export async function runVoteCleanup() {
  if (!delStatement) {
    const query = `delete from voters where rnd < (select max(rnd) from voters) - ${VOTE_ROUNDS_THRESHOLD}`;
    delStatement = await db.prepare(query);
  }
  await delStatement.run();
}

type VoterTuple = [number, string];
let insertVots: Record<string, Statement> = {};
export async function insertVoters(db: Database, voters: VoterTuple[]): Promise<void> {
  const num = voters.length;
  if (!(num in insertVots)) {
    console.warn("Making new insertVoters query", num);
    const qs = new Array(num).fill("(?, ?)").join(", ");
    const query = "INSERT INTO voters VALUES " + qs
    insertVots[num] = await db.prepare(query);
  }
  await insertVots[num].run(...voters.flat());
  const first = voters[0][0];
  const last = voters[voters.length - 1][0];
  console.log("INSERT voters", `${first}..${last}`);
}

export interface VoterCount {
  voter: string;
  blocks: number;
}

export async function getAllVoterCounts(db: Database, minRnd = 0, maxRnd = Infinity): Promise<VoterCount[]> {
  const rows = await db.all('select voter, count(rnd) as blocks from voters where rnd >= ? and rnd <= ? group by voter order by blocks desc', minRnd, maxRnd);
  return rows as VoterCount[];
}

export async function getVoterBlocks(db: Database, proposer: string, minRnd = 0, maxRnd = Infinity): Promise<number[]> {
  const rows = await db.all('select rnd from voters where voter = ? and rnd >= ? and rnd <= ?', proposer, minRnd, maxRnd);
  return rows.map(({rnd}) => rnd);
}

export interface ProposerCount {
  proposer: string;
  blocks: number;
}

export async function getAllProposerCounts(db: Database, minRnd = 0, maxRnd = Infinity): Promise<ProposerCount[]> {
  const rows = await db.all('select proposer, count(rnd) as blocks, sum(payout) as payouts from proposers where rnd >= ? and rnd <= ? group by proposer order by blocks desc', minRnd, maxRnd);
  return rows as ProposerCount[];
}

interface RndPP {
  rnd: number;
  pp?: number;
}
export async function getProposerBlocks(db: Database, proposer: string, minRnd = 0, maxRnd = Infinity): Promise<Array<RndPP>> {
  const rows = await db.all('select rnd, payout from proposers where proposer = ? and rnd >= ? and rnd <= ?', proposer, minRnd, maxRnd);
  return rows.map(({rnd, payout = 0}) => ({rnd, ...payout ? {pp: payout} : null}));
}

export async function getMaxRound(db: Database): Promise<number> {
  const rows = await db.all('select max(rnd) as max from proposers');
  return Number(rows[0].max);
}

export async function countRecords(db: Database): Promise<number> {
  const rows = await db.all('select count(*) as count from proposers');
  return Number(rows[0].count);
}

export async function getRoundExists(db: Database, rnd: number): Promise<boolean> {
  const rows = await db.all('select rnd from proposers where rnd = ?', rnd);
  return !!rows[0];
}

interface MissingRound {
  rnd: number;
  missing: number;
}
export async function getMissingRounds(db: Database): Promise<MissingRound[]> {
  // find missing rnds
  // returns <first missing> as rnd, <num missing> as missing
  // e.g. if it returns [13, 1] then only round 13 is missing
  // e.g. if it returns [13, 3] then rounds 13, 14, 15 are missing
  const rows = await db.all('select r1+1 as rnd, missing from (select rnd r1, lead(rnd) over (order by rnd rows between current row and 1 following) as r2, r2 - r1 - 1 as missing from proposers p) x where missing > 0');
  return rows.map(({rnd, missing}) => ({ rnd: Number(rnd), missing: Number(missing) }));
}
