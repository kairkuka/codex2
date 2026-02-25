import path from 'node:path';
import { promises as fs } from 'node:fs';
import { getSessions, removeSession, terminalStatuses } from './store.js';
import { sessionsTmpDir } from './paths.js';

const CLEANUP_INTERVAL_MS = 60_000;
const TTL_MS = 30 * 60 * 1000;
const sessionsTmpBase = sessionsTmpDir();
let started = false;

function isSafeSessionPath(baseDir: string, targetDir: string): boolean {
  const relative = path.relative(baseDir, targetDir);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function startCleanupScheduler(): void {
  if (started) {
    return;
  }
  started = true;

  setInterval(async () => {
    const now = Date.now();
    const sessions = getSessions();

    for (const session of sessions) {
      if (!terminalStatuses.includes(session.status)) {
        continue;
      }
      if (session.endedAt === null || now - session.endedAt <= TTL_MS) {
        continue;
      }

      const targetPath = path.resolve(sessionsTmpBase, session.id);
      if (isSafeSessionPath(sessionsTmpBase, targetPath)) {
        await fs.rm(targetPath, { recursive: true, force: true });
      }

      removeSession(session.id);
    }
  }, CLEANUP_INTERVAL_MS);
}
