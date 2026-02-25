import { Router } from 'express';
import { Server } from 'socket.io';
import { createSession, getSession, stopSession, type SessionMode } from '../sessions/store.js';

export function createSessionsRouter(io: Server) {
  const router = Router();

  router.post('/sessions', (req, res) => {
    const { startUrl, command, mode } = req.body as {
      startUrl?: string;
      command?: string;
      mode?: SessionMode;
    };

    if (!startUrl || !command || (mode !== 'agent' && mode !== 'manual')) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const session = createSession({ startUrl, command, mode });

    io.to(session.id).emit('session:update', {
      currentUrl: session.currentUrl,
      steps: session.steps,
      screenshotUrl: session.screenshotUrl,
    });

    return res.status(201).json({ sessionId: session.id });
  });

  router.post('/sessions/:id/stop', (req, res) => {
    const session = stopSession(req.params.id);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    io.to(session.id).emit('session:done', {
      currentUrl: session.currentUrl,
      steps: session.steps,
      screenshotUrl: session.screenshotUrl,
    });

    return res.json({ ok: true });
  });

  router.get('/sessions/:id', (req, res) => {
    const session = getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json(session);
  });

  return router;
}
