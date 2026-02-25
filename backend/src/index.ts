import cors from 'cors';
import express from 'express';
import http from 'node:http';
import { Server } from 'socket.io';
import { createSessionsRouter } from './routes/sessions.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());
app.use(createSessionsRouter(io));

io.on('connection', (socket) => {
  socket.on('session:join', ({ sessionId }: { sessionId?: string }) => {
    if (!sessionId) return;
    socket.join(sessionId);
  });
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
