import { algod } from './config.js';
import { getOrCreateDB, } from './db.js';
import { ingest } from './ingest.js';
import { start } from './server.js';

const dbClient = await getOrCreateDB();

ingest(dbClient, algod);

start(dbClient);
