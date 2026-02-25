import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { sessionDir, sessionsTmpDir } from '../sessions/paths.js';

const screenshotFilePattern = /^[0-9]+\.png$/;

export const screenshotRouter = Router();

screenshotRouter.get('/sessions/:id/screenshot/:file', async (req, res) => {
  const { id, file } = req.params;

  if (!screenshotFilePattern.test(file)) {
    return res.status(404).json({ error: 'Not found' });
  }

  const baseDir = sessionsTmpDir();
  const candidatePath = path.resolve(sessionDir(id), file);
  const relative = path.relative(baseDir, candidatePath);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    await fs.access(candidatePath);
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }

  return res.sendFile(candidatePath);
});
