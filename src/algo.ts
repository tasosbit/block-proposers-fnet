import algosdk from 'algosdk';
import { sleep } from './utils.js';

export async function getBlockProposer(algod: algosdk.Algodv2, rnd: number): Promise<string> {
  try {
    const { cert: { prop: { oprop } } } = await algod.block(rnd).do();
    return algosdk.encodeAddress(oprop);
  } catch(e) {
    console.error(`Fetch ${rnd} failed: ${(e as Error).message}`);
    await sleep(2000);
    return getBlockProposer(algod, rnd);
  }
}

export async function getLastRound(algod: algosdk.Algodv2): Promise<number> {
  const { "last-round": lr } = await algod.status().do();
  return lr;
}

export function statusAfterRound(algod: algosdk.Algodv2, rnd: number): Promise<Record<string, any>> {
  return algod.statusAfterBlock(rnd).do();
}
