import { Database } from "duckdb-async";

export function getClient(): Promise<Database> {
  return Database.create("data/db.duckdb");
}

async function getOrCreateDB(): Promise<Database> {
  let db: Database
  try {
    db = await getClient();
    await db.all("select 1");
  } catch(e) {
    console.error("DB Error", e);
    throw e;
  }
  try {
    await db.all("select * from state");
    return db;
  } catch(e) {
    console.error("error, assuming db uninited", e);
  }
  await createDB(db);
  return db;
}

async function createDB(db: Database) {
  console.warn("creating db");
  await db.exec("CREATE TABLE proposers(rnd INTEGER PRIMARY KEY, proposer VARCHAR)");
  await db.exec("CREATE TABLE state(key VARCHAR PRIMARY KEY, type VARCHAR, value VARCHAR)");
  await db.exec("INSERT INTO state VALUES ('lastRound', 'number', '1');");
}

async function getLastRound(db: Database): Promise<number> {
  const rows = await db.all("SELECT * from state");
  for(const { key, value } of rows) {
    if (key === "lastRound")
      return Number(value);
  }
  throw new Error("state.lastRound not in DB");
}

async function simpleTest() {
  const db = await getOrCreateDB();
  const LR = await getLastRound(db);
  console.log({LR});
  debugger;
}

simpleTest();
