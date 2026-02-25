# Codex2 Monorepo Scaffold

This repository contains a minimal monorepo scaffold with two apps:

- `backend` — TypeScript Node.js scaffold
- `mobile` — Expo React Native (with web) scaffold

## Node version

Use **Node.js 20**.

## Run backend

```bash
cd backend
npm i
npm run dev
```

## Run mobile (web)

```bash
cd mobile
npm i
npm run web
```

## Quick Socket.IO test note

After starting backend, you can quickly test realtime events from a Node script:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');
socket.on('connect', () => {
  socket.emit('session:join', { sessionId: 'your-session-id' });
});
socket.on('session:joined', console.log);
socket.on('session:update', console.log);
socket.on('session:done', console.log);
```
