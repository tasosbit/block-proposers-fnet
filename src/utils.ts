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

export async function retryable<T>(fn: () => Promise<T>, maxTries=3, waitFor=2800, tries=0): Promise<T> {
  try {
    return await fn();
  } catch(e) {
    if (tries < maxTries) {
      if (tries > 0) {
        console.warn(`Retryable error (retries=${tries}): ${(e as Error).message}`);
      }
      await sleep(waitFor);
      return retryable(fn, maxTries, waitFor, tries+1);
    } else {
      throw e;
    }
  }
}
