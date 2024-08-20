import { algod } from './config.js';
import { getBlockProposer } from './algo.js';
import { getOrCreateDB, getLastRound, insertProposer, } from './db.js';

const dbClient = await getOrCreateDB();
let round = await getLastRound(dbClient);

while(true) {
  round++;
  const prop = await getBlockProposer(algod, round);
  await insertProposer(dbClient, round, prop);
  console.log("INSERT", round, prop.slice(0, 8));
}
