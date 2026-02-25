import path from 'node:path';

export function sessionsTmpDir(): string {
  return path.resolve(process.cwd(), 'tmp', 'sessions');
}

export function sessionDir(sessionId: string): string {
  return path.join(sessionsTmpDir(), sessionId);
}
