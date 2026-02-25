import type { Browser, BrowserContext, Page } from 'playwright';

type Runtime = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
};

const runtimes = new Map<string, Runtime>();

export function setRuntime(sessionId: string, runtime: Runtime): void {
  runtimes.set(sessionId, runtime);
}

export function getRuntime(sessionId: string): Runtime | undefined {
  return runtimes.get(sessionId);
}

export async function disposeRuntime(sessionId: string): Promise<void> {
  const runtime = runtimes.get(sessionId);
  if (!runtime) {
    return;
  }

  try {
    await runtime.context.close();
  } catch {
    // never throw from disposer
  }

  try {
    await runtime.browser.close();
  } catch {
    // never throw from disposer
  }

  runtimes.delete(sessionId);
}
