export type RmfE2eProbe = {
  sessionStarts: Record<string, number>;
};

declare global {
  interface Window {
    __RMF_E2E__?: RmfE2eProbe;
  }
}

/** No-op unless a test installed `window.__RMF_E2E__` before boot. */
export function recordRemoteSessionStart(remoteId: string): void {
  const probe = window.__RMF_E2E__;

  if (!probe) {
    return;
  }

  probe.sessionStarts[remoteId] = (probe.sessionStarts[remoteId] ?? 0) + 1;

  try {
    sessionStorage.setItem('__RMF_E2E__', JSON.stringify(probe));
  } catch {
    // Test probe only; ignore quota / private-mode failures.
  }
}
