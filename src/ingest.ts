import algosdk from 'algosdk';
import { Database, } from "duckdb-async";
import { statusAfterRound, getBlockProposerAndPayout, getLastRound, } from './algo.js';
import { getLastRound as getLastDBRound, insertProposer, insertProposers, getMaxRound, countRecords, getRoundExists, getMissingRounds, } from './db.js';
import { sleep, chunk, parseEnvInt, } from './utils.js';
import pmap from 'p-map';

const DB_CHUNKS = parseEnvInt("DB_CHUNKS", 100);
const NET_CONCURRENCY = parseEnvInt("CONCURRENCY", 10);
const SYNC_THRESHOLD = parseEnvInt("SYNC_THRESHOLD", 10);
const EMIT_SPEED_EVERY = parseEnvInt("EMIT_SPEED_EVERY", 4);

export async function needsSync(dbClient: Database, algod: algosdk.Algodv2): Promise<[number, number, boolean]> {
  const lastDBRound = await getLastDBRound(dbClient);
  const lastLiveRound = await getLastRound(algod);
  return [lastDBRound, lastLiveRound, lastLiveRound - lastDBRound > SYNC_THRESHOLD];
}

async function runBlock(dbClient: Database, algod: algosdk.Algodv2, rnd: number) {
  const [prop, payout] = await getBlockProposerAndPayout(algod, rnd);
  await insertProposer(dbClient, rnd, prop, payout);
}

async function syncRounds(dbClient: Database, algod: algosdk.Algodv2, rounds: number[]) {
  const chunks = chunk(rounds, DB_CHUNKS);
  let emitIdx=0;
  let startTime = Date.now();
  for(const chunk of chunks) {
    const proposers = await pmap(chunk, round => getBlockProposerAndPayout(algod, round), { concurrency: NET_CONCURRENCY });
    const tuples: [number, string, number][] = proposers.map(([prop, pay], i) => ([chunk[i], prop, pay]));
    await insertProposers(dbClient, ...tuples);
    if (++emitIdx % EMIT_SPEED_EVERY === 0) {
      const elapsed = Date.now() - startTime;
      console.log('records/sec', EMIT_SPEED_EVERY * chunk.length / elapsed * 1000);
      startTime = Date.now();
    }
  }
}

export async function sync(dbClient: Database, algod: algosdk.Algodv2, lastDBRound: number, lastLiveRound: number) {
  const diff = lastLiveRound - lastDBRound;
  const rounds = new Array(diff).fill(null).map((_, i) => lastDBRound + i + 1);
  await syncRounds(dbClient, algod, rounds);
  console.log("Sync done");
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
        console.error("Uncaught while trailing", (e as Error).message);
        await sleep(1500);
      }
    }
  }
}

export async function backfill(dbClient: Database, algod: algosdk.Algodv2) {
  let maxRound = await getMaxRound(dbClient);
  let records = await countRecords(dbClient);
  let diff = maxRound - records;
  if (diff > 0) {
    console.log("Backfilling, records", records, "maxRound", maxRound);
    const missingRecords = await getMissingRounds(dbClient);
    console.log("Missing:", missingRecords);
    const missingRounds = [];
    for(const { rnd, missing } of missingRecords) {
      for(let r = rnd; r < rnd + missing; r++) {
        missingRounds.push(r);
      }
    }
    console.log("Total to backfill:", missingRounds.length);
    await syncRounds(dbClient, algod, missingRounds);
    console.log("Backfill done");
    maxRound = await getMaxRound(dbClient);
    records = await countRecords(dbClient);
    diff = maxRound - records;
    console.log("Backfill sanity check, records", records, "maxRound", maxRound);
    if (records !== maxRound) {
      throw new Error("backfill failed; records missing");
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
    console.log("Syncing", lastDBRound, '->', lastLiveRound, 'delta', lastLiveRound - lastDBRound, 'concurrency', NET_CONCURRENCY);
    await sync(dbClient, algod, lastDBRound, lastLiveRound);
  }
  await trail(dbClient, algod);
}
