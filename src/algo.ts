import algosdk from 'algosdk';
import { sleep } from './utils.js';

export async function getBlockProposerAndPayout(algod: algosdk.Algodv2, rnd: number): Promise<[string, number]> {
  const { block: { pp = 0 }, cert: { prop: { oprop } } } = await algod.block(rnd).do();
  return [algosdk.encodeAddress(oprop), pp];
}

export async function getBlockProposer(algod: algosdk.Algodv2, rnd: number): Promise<string> {
  const { cert: { prop: { oprop } } } = await algod.block(rnd).do();
  return algosdk.encodeAddress(oprop);
}

export async function getGenesisID(algod: algosdk.Algodv2): Promise<string> {
  const { genesisID } = await algod.getTransactionParams().do();
  return genesisID;
}

export async function getLastRound(algod: algosdk.Algodv2): Promise<number> {
  const { "last-round": lr } = await algod.status().do();
  return lr;
}

export async function statusAfterRound(algod: algosdk.Algodv2, rnd: number): Promise<Record<string, any>> {
  return algod.statusAfterBlock(rnd).do();
}
