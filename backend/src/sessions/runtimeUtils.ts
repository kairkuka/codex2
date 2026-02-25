import { chromium } from 'playwright';

export async function createRuntime(startUrl: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(startUrl, { waitUntil: 'domcontentloaded' });

  return { browser, context, page };
}
