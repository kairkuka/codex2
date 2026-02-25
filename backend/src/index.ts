import cors from 'cors';
import express from 'express';
import { sessionsRouter } from './routes/sessions.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(sessionsRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
