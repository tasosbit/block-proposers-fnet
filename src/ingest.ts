import algosdk from 'algosdk';
import { Database, } from "duckdb-async";
import { statusAfterRound, getBlockProposer, getLastRound, } from './algo.js';
import { getLastRound as getLastDBRound, insertProposer, insertProposers, getMaxRound, countRecords, getRoundExists, } from './db.js';
import { sleep, chunk } from './utils.js';
import pmap from 'p-map';

const CONCURRENCY = process.env.CONCURRENCY ? Number(process.env.CONCURRENCY) : 5;
const SYNC_THRESHOLD = 10;

export async function needsSync(dbClient: Database, algod: algosdk.Algodv2): Promise<[number, number, boolean]> {
  const lastDBRound = await getLastDBRound(dbClient);
  const lastLiveRound = await getLastRound(algod);
  return [lastDBRound, lastLiveRound, lastLiveRound - lastDBRound > SYNC_THRESHOLD];
}

async function runBlock(dbClient: Database, algod: algosdk.Algodv2, rnd: number) {
  const prop = await getBlockProposer(algod, rnd);
  await insertProposer(dbClient, rnd, prop);
}

export async function sync(dbClient: Database, algod: algosdk.Algodv2, lastDBRound: number, lastLiveRound: number) {
  const diff = lastLiveRound - lastDBRound;
  const rounds = new Array(diff).fill(null).map((_, i) => lastDBRound + i + 1);
  const chunks = chunk(rounds, CONCURRENCY);
  for(const chunk of chunks) {
    const proposers = await pmap(chunk, round => getBlockProposer(algod, round), { concurrency: CONCURRENCY });
    const tuples: [number, string][] = proposers.map((prop, i) => ([chunk[i], prop]));
    await insertProposers(dbClient, ...tuples);
  }
}

export async function trail(dbClient: Database, algod: algosdk.Algodv2) {
  let lastDBRound = await getLastDBRound(dbClient);
  while(true) {
    try {
      const nextRound = lastDBRound + 1;
      await runBlock(dbClient, algod, nextRound);
      lastDBRound++;
    } catch(e) {
      if ((e as Error).message.includes('failed to retrieve information from the ledger')) {
        await statusAfterRound(algod, lastDBRound);
      } else {
        console.error("Uncaught", (e as Error).message);
        await sleep(1500);
      }
    }
  }
}

export async function backfill(dbClient: Database, algod: algosdk.Algodv2) {
  const maxRound = await getMaxRound(dbClient);
  const records = await countRecords(dbClient);
  const diff = maxRound - records;
  if (diff > 0) {
    console.log("Backfilling, records", records, "maxRound", maxRound);
    const start = maxRound - diff - 10;
    for(let rnd = start; rnd < maxRound-1; rnd++) {
      if (!(await getRoundExists(dbClient, rnd))) {
        console.log("Backfill", rnd);
        await runBlock(dbClient, algod, rnd);
      }
    }
  }
}

export async function ingest(dbClient: Database, algod: algosdk.Algodv2) {
  await backfill(dbClient, algod);
  while(true) {
    const [lastDBRound, lastLiveRound, doSync] = await needsSync(dbClient, algod);
    if (!doSync) {
      console.log("Trailing", lastDBRound, '->', lastLiveRound, 'delta', lastLiveRound - lastDBRound);
      break;
    }
    console.log("Syncing", lastDBRound, '->', lastLiveRound, 'delta', lastLiveRound - lastDBRound, 'concurrency', CONCURRENCY);
    await sync(dbClient, algod, lastDBRound, lastLiveRound);
  }
  await trail(dbClient, algod);
}
