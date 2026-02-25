import { Router } from 'express';
import { Server } from 'socket.io';
import { emitDone, emitUpdate } from '../sessions/emitter.js';
import { disposeRuntime, setRuntime } from '../sessions/runtime.js';
import { createRuntime } from '../sessions/runtimeUtils.js';
import {
  createSession,
  getSession,
  requestStop,
  setStatus,
  type SessionMode,
} from '../sessions/store.js';
import type { SessionDonePayload, SessionUpdatePayload } from '../ws/types.js';

export function createSessionsRouter(io: Server) {
  const sessionsRouter = Router();

  sessionsRouter.post('/sessions', async (req, res) => {
    const { startUrl, command, mode } = req.body as {
      startUrl?: string;
      command?: string;
      mode?: SessionMode;
    };

    if (!startUrl || !command || (mode !== 'agent' && mode !== 'manual')) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const session = createSession({ startUrl, command, mode });

    try {
      const runtime = await createRuntime(startUrl);
      setRuntime(session.id, runtime);
    } catch {
      setStatus(session.id, 'ERROR');
      const donePayload: SessionDonePayload = {
        summary: 'Runtime bootstrap failed',
        finalStatus: 'ERROR',
      };
      emitDone(io, session.id, donePayload);
      return res.status(500).json({ error: 'Runtime bootstrap failed' });
    }

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

  sessionsRouter.post('/sessions/:id/stop', async (req, res) => {
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

    await disposeRuntime(id);

    return res.json({ ok: true });
  });

  return sessionsRouter;
}
