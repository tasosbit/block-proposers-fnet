import algosdk from 'algosdk';

export async function getBlockProposer(algod: algosdk.Algodv2, rnd: number): Promise<string> {
  const { cert: { prop: { oprop } } } = await algod.block(rnd).do();
  return algosdk.encodeAddress(oprop);
}

export async function getLastBlock(algod: algosdk.Algodv2): Promise<number> {
  const { "last-round": lr } = await algod.status().do();
  return lr;
}

export function statusAfterRound(algod: algosdk.Algodv2, rnd: number): Promise<Record<string, any>> {
  return algod.statusAfterBlock(rnd).do();
}
