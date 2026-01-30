import algosdk from 'algosdk';
import { sleep } from './utils.js';

interface BlockResult {
  ts: number;
  proposer: string;
  payout: number;
  voters: string[];
  evictions: string[];
}

async function multiQuery<T>(algods: algosdk.Algodv2[], queryFn: (algod: algosdk.Algodv2) => Promise<T>): Promise<T> {
  for(let i=0; i < algods.length; i++) {
    const algod = algods[i];
    const isLast = i === algods.length - 1;
    try {
      return await queryFn(algod);
    } catch(e) {
      if (isLast) {
        throw e;
      }
      const { response, message } = e as any;
      const msg = response ?? message ?? e;
      console.warn(`Algod ${i} query failed, trying next algod`, msg);
      continue;
    }
  }
  throw new Error("Never exhausted algods without throw")
}

export async function getBlockDetails(algods: algosdk.Algodv2[], rnd: number): Promise<BlockResult> {
  const { block: { ts, pp = 0, partupdabs = [] }, cert: { prop: { oprop }, vote } } = await multiQuery(algods, algod => algod.block(rnd).do());
  const voters = vote.map(({snd}: any) => algosdk.encodeAddress(snd));
  return {
    ts,
    proposer: algosdk.encodeAddress(oprop),
    payout: pp,
    voters,
    evictions: partupdabs.map((raw: Uint8Array) => algosdk.encodeAddress(raw)),
  }
}


export async function getGenesisID(algods: algosdk.Algodv2[]): Promise<string> {
  const { genesisID } = await multiQuery(algods, algod => algod.getTransactionParams().do());
  return genesisID;
}

export async function getLastRound(algods: algosdk.Algodv2[]): Promise<number> {
  const { "last-round": lr } = await multiQuery(algods, algod => algod.status().do());
  return lr;
}

export async function statusAfterRound(algods: algosdk.Algodv2[], rnd: number): Promise<Record<string, any>> {
  return multiQuery(algods, algod => algod.statusAfterBlock(rnd).do());
}
