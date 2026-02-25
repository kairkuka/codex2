export type SessionMode = 'agent' | 'manual';

export type SessionStep = {
  stepIndex: number;
  action: string;
  status: string;
};

export type Session = {
  id: string;
  startUrl: string;
  command: string;
  mode: SessionMode;
  currentUrl: string;
  steps: SessionStep[];
  screenshotUrl?: string;
  stopped: boolean;
};

const sessions = new Map<string, Session>();

export function createSession(data: { startUrl: string; command: string; mode: SessionMode }): Session {
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    startUrl: data.startUrl,
    command: data.command,
    mode: data.mode,
    currentUrl: data.startUrl,
    steps: [],
    stopped: false,
  };
  sessions.set(id, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  return sessions.get(sessionId);
}

export function stopSession(sessionId: string): Session | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  session.stopped = true;
  return session;
}
