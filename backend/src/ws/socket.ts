import { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';

export function initSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('session:join', (payload: { sessionId?: string }) => {
      const sessionId = payload?.sessionId;
      if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        return;
      }

      socket.join(sessionId);
      socket.emit('session:joined', { sessionId });
    });
  });

  return { io };
}
