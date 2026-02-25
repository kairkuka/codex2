import { Router } from 'express';
import { createSession, getSession, stopSession, type SessionMode } from '../sessions/store.js';

export const sessionsRouter = Router();

sessionsRouter.post('/sessions', (req, res) => {
  const { startUrl, command, mode } = req.body as {
    startUrl?: string;
    command?: string;
    mode?: SessionMode;
  };

  if (!startUrl || !command || (mode !== 'agent' && mode !== 'manual')) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const session = createSession({ startUrl, command, mode });
  return res.status(201).json({ sessionId: session.id });
});

sessionsRouter.get('/sessions/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json(session);
});

sessionsRouter.post('/sessions/:id/stop', (req, res) => {
  const session = stopSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.json({ ok: true });
});
