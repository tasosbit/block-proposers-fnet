import { algod } from './config.js';
import { getOrCreateDB, } from './db.js';
import { ingest } from './ingest.js';
import { start } from './server.js';
import { getGenesisID } from './algo.js';

const genesisID = await getGenesisID(algod);

const dbClient = await getOrCreateDB(genesisID);

ingest(dbClient, algod);

start(dbClient);
