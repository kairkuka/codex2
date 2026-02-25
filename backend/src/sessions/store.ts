export type SessionMode = 'agent' | 'manual';
export type SessionStatus = 'RUNNING' | 'STOPPED';

export type Session = {
  id: string;
  startUrl: string;
  command: string;
  mode: SessionMode;
  status: SessionStatus;
  createdAt: number;
};

const sessions = new Map<string, Session>();

export function createSession(data: {
  startUrl: string;
  command: string;
  mode: SessionMode;
}): Session {
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    startUrl: data.startUrl,
    command: data.command,
    mode: data.mode,
    status: 'RUNNING',
    createdAt: Date.now(),
  };

  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function stopSession(id: string): Session | undefined {
  const session = sessions.get(id);
  if (!session) {
    return undefined;
  }

  session.status = 'STOPPED';
  return session;
}
