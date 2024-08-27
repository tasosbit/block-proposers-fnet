import { algod } from './config.js';
import { getOrCreateDB, } from './db.js';
import { ingest } from './ingest.js';
import { start } from './server.js';
import { getGenesisID } from './algo.js';
import { retryable } from './utils.js';

const genesisID = await retryable(() => getGenesisID(algod));

const dbClient = await getOrCreateDB(genesisID);

ingest(dbClient, algod);

start(dbClient);
