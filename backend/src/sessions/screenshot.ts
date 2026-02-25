import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright';
import { sessionDir } from './paths.js';

export async function saveScreenshot(sessionId: string, page: Page, index: number): Promise<string> {
  const dir = sessionDir(sessionId);
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${index}.png`);
  await page.screenshot({ path: filePath, fullPage: true });

  return filePath;
}
