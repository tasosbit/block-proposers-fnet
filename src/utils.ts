export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function chunk<T>(elems: T[], num=20): T[][] {
  return elems.reduce((out: T[][], cur: T) => {
    let last = out[out.length - 1];
    if (last.length == num) {
      out.push([]);
      last = out[out.length -1];
    }
    last.push(cur);
    return out;
  }, [[]] as T[][]);
}

export function parseEnvInt(name: string, _default: number): number {
  if (process.env[name]) {
    return Number(process.env[name]);
  }
  return _default;
}

export async function retryable<T>(fn: () => Promise<T>, maxTries=3, tries=0): Promise<T> {
  try {
    return await fn();
  } catch(e) {
    if (tries < maxTries) {
      console.warn(`Retryable error (tries=${tries}): ${(e as Error).message}`);
      await sleep(2000);
      return retryable(fn, maxTries, tries+1);
    } else {
      throw e;
    }
  }
}
