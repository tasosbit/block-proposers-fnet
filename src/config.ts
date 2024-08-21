import algosdk from 'algosdk';

const TOKEN = process.env.ALGOD_TOKEN ?? "";
const HOST = process.env.ALGOD_HOST ?? "https://fnet-api.d13.co";
const PORT = process.env.ALGOD_PORT ?? "443";

export const algod = new algosdk.Algodv2(TOKEN, HOST, PORT);
