import { algod } from './config.js';
import { statusAfterRound, getBlockProposer } from './algo.js';
import { getOrCreateDB, getLastRound, insertProposer, } from './db.js';

const dbClient = await getOrCreateDB();
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
