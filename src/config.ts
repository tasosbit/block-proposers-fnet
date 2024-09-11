import { parseEnvInt } from './utils.js';
import algosdk from 'algosdk';

const TOKEN = process.env.ALGOD_TOKEN ?? "";
const HOST = process.env.ALGOD_HOST ?? "https://fnet-api.d13.co";
const PORT = process.env.ALGOD_PORT ?? "443";

export const algod = new algosdk.Algodv2(TOKEN, HOST, PORT);

export const VOTE_ROUNDS_THRESHOLD = parseEnvInt("VOTE_ROUNDS_THRESHOLD", 100_000);
export const DB_CHUNKS = parseEnvInt("DB_CHUNKS", 100);
export const NET_CONCURRENCY = parseEnvInt("CONCURRENCY", 10);
export const SYNC_THRESHOLD = parseEnvInt("SYNC_THRESHOLD", 10);
export const EMIT_SPEED_EVERY = parseEnvInt("EMIT_SPEED_EVERY", 4);
