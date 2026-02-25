import type { Server } from 'socket.io';
import type { SessionDonePayload, SessionUpdatePayload } from '../ws/types.js';

export function emitUpdate(io: Server, sessionId: string, payload: SessionUpdatePayload): void {
  io.to(sessionId).emit('session:update', payload);
}

export function emitDone(io: Server, sessionId: string, payload: SessionDonePayload): void {
  io.to(sessionId).emit('session:done', payload);
}
