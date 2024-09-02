import { algod } from './config.js';
import { getOrCreateDB, } from './db.js';
import { ingest } from './ingest.js';
import { start } from './server.js';
import { getGenesisID } from './algo.js';
import { retryable } from './utils.js';
import { lockPIDFile, releasePIDFile } from './pid.js';

const expectedGenesisID = process.argv[2];

const genesisID = await retryable(() => getGenesisID(algod));

if (genesisID !== expectedGenesisID) {
  throw new Error(`Genesis ID mismatch, expected ${expectedGenesisID} found ${genesisID}`);
}

lockPIDFile(genesisID);

const dbClient = await getOrCreateDB(genesisID);

ingest(dbClient, algod);

start(dbClient);

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('uncaughtException', handleExit);

async function handleExit(e: any) {
  console.log(e);
  console.log("Closing DB");
  await dbClient.close();
  console.log("OK");
  releasePIDFile(genesisID);
  process.exit(0);
}
