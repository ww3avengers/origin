/* OProjekte Analytics SDK */

export type SDKOptions = {
  endpointBase?: string; // default '/api/analytics/ingest'
  consent?: () => boolean; // return false to disable sending
};

let options: Required<SDKOptions> = {
  endpointBase: '/api/analytics/ingest',
  consent: () => true,
};

export function init(userOptions?: SDKOptions) {
  options = { ...options, ...(userOptions || {}) };
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> (c === 'x' ? 0 : 2);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const VISITOR_KEY = 'analytics_visitor_id';
const SESSION_KEY = 'analytics_session_id';
let lastSentUrl = '';
let inflight = false;

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = uuid();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uuid();
  }
}

export async function trackPageView(url?: string) {
  if (!options.consent()) return;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  if (!currentUrl) return;
  if (currentUrl === lastSentUrl || inflight) return;
  inflight = true;

  const body = {
    url: currentUrl,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };

  try {
    await fetch(`${options.endpointBase}/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'include',
    });
    lastSentUrl = currentUrl;
  } catch (_) {
  } finally {
    inflight = false;
  }
}

export async function trackEvent(params: { type: string; payload?: unknown; visitId?: number | string }) {
  if (!options.consent()) return;
  const body = {
    type: params.type,
    payload: params.payload ?? null,
    visitId: params.visitId ?? null,
  };
  try {
    await fetch(`${options.endpointBase}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'include',
    });
  } catch (_) {}
}

export async function trackVitals(params: {
  visitId?: number | string;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  inp?: number;
}) {
  if (!options.consent()) return;
  const body = { ...params };
  try {
    await fetch(`${options.endpointBase}/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'include',
    });
  } catch (_) {}
}
