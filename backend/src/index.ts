import cors from 'cors';
import express from 'express';
import http from 'node:http';
import { createSessionsRouter } from './routes/sessions.js';
import { initSocket } from './ws/socket.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
const { io } = initSocket(server);

app.use(createSessionsRouter(io));

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
