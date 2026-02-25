import { Router } from 'express';
import { Server } from 'socket.io';
import {
  createSession,
  getSession,
  requestStop,
  setStatus,
  type SessionMode,
} from '../sessions/store.js';
import { emitDone, emitUpdate } from '../sessions/emitter.js';
import type { SessionDonePayload, SessionUpdatePayload } from '../ws/types.js';

export function createSessionsRouter(io: Server) {
  const sessionsRouter = Router();

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

    const payload: SessionUpdatePayload = {
      stepIndex: 0,
      action: 'created',
      status: 'DONE',
      url: startUrl,
    };
    emitUpdate(io, session.id, payload);

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
    const id = req.params.id;
    const stopRequested = requestStop(id);
    if (!stopRequested) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const session = setStatus(id, 'STOPPED');
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const payload: SessionDonePayload = {
      summary: 'Stopped by user',
      finalUrl: session.lastUrl,
      finalStatus: 'STOPPED',
    };
    emitDone(io, session.id, payload);

    return res.json({ ok: true });
  });

  return sessionsRouter;
}
