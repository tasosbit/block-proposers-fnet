import algosdk from 'algosdk';
import { Database, } from "duckdb-async";
import { statusAfterRound, getBlockProposer } from './algo.js';
import { getLastRound, insertProposer, } from './db.js';

export async function ingest(dbClient: Database, algod: algosdk.Algodv2) {
  let round = await getLastRound(dbClient);

  let synced = false;
  while(true) {
    try {
      const nextRound = round + 1;
      const prop = await getBlockProposer(algod, nextRound);
      await insertProposer(dbClient, nextRound, prop);
      round++;
    } catch(e) {
      if ((e as Error).message.includes('failed to retrieve information from the ledger')) {
        if (!synced) {
          console.warn("synced");
          synced = true;
        }
        await statusAfterRound(algod, round);
      } else {
        console.error("Uncaught", (e as Error).message);
        throw e;
      }
    }
  }
}
