import { algod } from './config.js';
import { getLastBlock, getBlockProposer } from './algo.js';

const lastRound = await getLastBlock(algod);

const prop = await getBlockProposer(algod, lastRound);
console.log({lastRound, prop});
