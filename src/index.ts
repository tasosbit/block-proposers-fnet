import { algods } from './config.js';
import { getOrCreateDB, } from './db.js';
import { ingest } from './ingest.js';
import { start } from './server.js';
import { getGenesisID } from './algo.js';
import { retryable } from './utils.js';
import { lockPIDFile, releasePIDFile } from './pid.js';

const expectedGenesisID = process.argv[2];
const dbID = process.argv[3] ?? expectedGenesisID;

const genesisID = await retryable(() => getGenesisID(algods));

if (genesisID !== expectedGenesisID) {
  throw new Error(`Genesis ID mismatch, expected ${expectedGenesisID} found ${genesisID}`);
}

lockPIDFile(dbID);

const dbClient = await getOrCreateDB(dbID);

ingest(dbClient, algods);

start(dbClient);

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('uncaughtException', handleExit);

async function handleExit(e: any) {
  console.log(e);
  console.log("Closing DB");
  await dbClient.close();
  console.log("OK");
  releasePIDFile(dbID);
  process.exit(0);
}
