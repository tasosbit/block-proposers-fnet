import algosdk from 'algosdk';
import { sleep } from './utils.js';

export async function getBlockProposerAndPayout(algod: algosdk.Algodv2, rnd: number): Promise<[string, number]> {
  try {
    const { block: { pp = 0 }, cert: { prop: { oprop } } } = await algod.block(rnd).do();
    return [algosdk.encodeAddress(oprop), pp];
  } catch(e) {
    if ((e as Error).message.includes('failed to retrieve information from the ledger')) {
      throw e;
    }
    console.error(`Fetch ${rnd} failed: ${(e as Error).message}`);
    await sleep(2000);
    return getBlockProposerAndPayout(algod, rnd);
  }
}

export async function getBlockProposer(algod: algosdk.Algodv2, rnd: number): Promise<string> {
  try {
    const { cert: { prop: { oprop } } } = await algod.block(rnd).do();
    return algosdk.encodeAddress(oprop);
  } catch(e) {
    if ((e as Error).message.includes('failed to retrieve information from the ledger')) {
      throw e;
    }
    console.error(`Fetch ${rnd} failed: ${(e as Error).message}`);
    await sleep(2000);
    return getBlockProposer(algod, rnd);
  }
}

export async function getGenesisID(algod: algosdk.Algodv2): Promise<string> {
  const { genesisID } = await algod.getTransactionParams().do();
  return genesisID;
}

export async function getLastRound(algod: algosdk.Algodv2): Promise<number> {
  const { "last-round": lr } = await algod.status().do();
  return lr;
}

export function statusAfterRound(algod: algosdk.Algodv2, rnd: number): Promise<Record<string, any>> {
  return algod.statusAfterBlock(rnd).do();
}
