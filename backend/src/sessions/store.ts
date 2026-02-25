import type { Session, SessionStatus, SessionStep } from '../types/session.js';

export type SessionMode = 'agent' | 'manual';

const sessions = new Map<string, Session>();

const terminalStatuses: SessionStatus[] = [
  'DONE',
  'STOPPED',
  'ERROR',
  'REQUIRES_MANUAL_CONFIRMATION',
];

export function createSession(data: {
  startUrl: string;
  command: string;
  mode: SessionMode;
}): Session {
  const now = Date.now();
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    startUrl: data.startUrl,
    command: data.command,
    mode: data.mode,
    status: 'RUNNING',
    stopRequested: false,
    createdAt: now,
    updatedAt: now,
    endedAt: null,
    lastUrl: data.startUrl,
    steps: [],
    lastResponseId: null,
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function requestStop(id: string): boolean {
  const session = sessions.get(id);
  if (!session) {
    return false;
  }

  session.stopRequested = true;
  session.updatedAt = Date.now();
  return true;
}

export function setStatus(id: string, status: SessionStatus): Session | undefined {
  const session = sessions.get(id);
  if (!session) {
    return undefined;
  }

  session.status = status;
  session.updatedAt = Date.now();

  if (terminalStatuses.includes(status) && session.endedAt === null) {
    session.endedAt = Date.now();
  }

  return session;
}

export function setLastUrl(id: string, url: string): void {
  const session = sessions.get(id);
  if (!session) {
    return;
  }

  session.lastUrl = url;
  session.updatedAt = Date.now();
}

export function addStep(id: string, step: SessionStep): void {
  const session = sessions.get(id);
  if (!session) {
    return;
  }

  session.steps.push(step);
  session.updatedAt = Date.now();
}

export function setLastResponseId(id: string, responseId: string): void {
  const session = sessions.get(id);
  if (!session) {
    return;
  }

  session.lastResponseId = responseId;
  session.updatedAt = Date.now();
}
