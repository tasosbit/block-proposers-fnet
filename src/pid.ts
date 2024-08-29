import { readFileSync, writeFileSync, existsSync, unlinkSync, } from 'fs';

function genesisToPIDpath(genesis: string) {
  return `data/${genesis}.pid`
}

export function lockPIDFile(genesis: string) {
  const filename = genesisToPIDpath(genesis);
  if (existsSync(filename)) {
    const pid = readFileSync(filename).toString();
    throw new Error(`Can not acquire lock for ${genesis}, already running as ${pid}`);
  } else {
    writeFileSync(filename, process.pid.toString());
  }
}

export function releasePIDFile(genesis: string) {
  const filename = genesisToPIDpath(genesis);
  if (!existsSync(filename)) {
    console.warn(`Can not release lock for ${genesis}, file ${filename} not found`);
  } else {
    unlinkSync(filename);
  }
}
