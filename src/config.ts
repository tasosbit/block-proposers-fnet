import { parseEnvInt } from "./utils.js";
import algosdk from "algosdk";

const TOKEN = process.env.ALGOD_TOKEN ?? "";
const HOST = process.env.ALGOD_HOST ?? "https://fnet-api.d13.co";
const PORT = process.env.ALGOD_PORT ?? "443";

const tokenParts = TOKEN.split(";").length;
const hostParts = HOST.split(";").length;
const portParts = PORT.split(";").length;

const numAlgods = Math.max(
  TOKEN.split(";").length,
  HOST.split(";").length,
  PORT.split(";").length,
);

if (numAlgods > 1) {
    const tokenConsistent = tokenParts === 1 || tokenParts === numAlgods;
    const hostConsistent = hostParts === 1 || hostParts === numAlgods;
    const portConsistent = portParts === 1 || portParts === numAlgods;
    if (!tokenConsistent) {
        throw new Error("Inconsistent number of ALGOD_TOKEN entries, expecting either 1 or " + numAlgods);
    }
    if (!hostConsistent) {
        throw new Error("Inconsistent number of ALGOD_HOST entries, expecting either 1 or " + numAlgods);
    }
    if (!portConsistent) {
        throw new Error("Inconsistent number of ALGOD_PORT entries, expecting either 1 or " + numAlgods);
    }
}

export const algods = Array.from({ length: numAlgods }, (_, i) => {
    const token = TOKEN.split(";").length === 1 ? TOKEN : TOKEN.split(";")[i];
    const host = HOST.split(";").length === 1 ? HOST : HOST.split(";")[i];
    const port = PORT.split(";").length === 1 ? PORT : PORT.split(";")[i];
    console.log("Configured algod", i, { host, port, token: token ? "yes" : "no" });
    return new algosdk.Algodv2(token, host, port);
})

export const VOTE_ROUNDS_THRESHOLD = parseEnvInt(
  "VOTE_ROUNDS_THRESHOLD",
  100_000,
);
export const DB_CHUNKS = parseEnvInt("DB_CHUNKS", 100);
export const NET_CONCURRENCY = parseEnvInt("CONCURRENCY", 10);
export const SYNC_THRESHOLD = parseEnvInt("SYNC_THRESHOLD", 10);
export const EMIT_SPEED_EVERY = parseEnvInt("EMIT_SPEED_EVERY", 4);