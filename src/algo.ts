import algosdk from 'algosdk';
import { sleep } from './utils.js';

interface BlockResult {
  proposer: string;
  payout: number;
  voters: string[];
  evictions: string[];
}

export async function getBlockDetails(algod: algosdk.Algodv2, rnd: number): Promise<BlockResult> {
  const { block: { pp = 0, partupdabs = [] }, cert: { prop: { oprop }, vote } } = await algod.block(rnd).do();
  const voters = vote.map(({snd}: any) => algosdk.encodeAddress(snd));
  return {
    proposer: algosdk.encodeAddress(oprop),
    payout: pp,
    voters,
    evictions: partupdabs.map((raw: Uint8Array) => algosdk.encodeAddress(raw)),
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

export async function statusAfterRound(algod: algosdk.Algodv2, rnd: number): Promise<Record<string, any>> {
  return algod.statusAfterBlock(rnd).do();
}
