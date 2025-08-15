/*
  Lightweight client-side analytics tracker for page views.
  - Persists visitorId (localStorage) and sessionId (sessionStorage)
  - Sends POST /api/analytics/ingest/visit with url & referrer
  - Deduplicates rapid successive calls for the same URL
*/

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> (c === 'x' ? 0 : 2);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generic event tracking with arbitrary props
export async function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!name) return;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const body = {
    name,
    url: currentUrl,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    ts: Date.now(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    properties: properties || {},
  };

  try {
    await fetch('/api/analytics/ingest/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'include',
    });
  } catch (_) {
    // swallow errors – analytics must not break UX
  }
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
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  if (!currentUrl) return;

  // prevent flooding on identical consecutive routes
  if (currentUrl === lastSentUrl || inflight) return;
  inflight = true;

  const body = {
    url: currentUrl,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };

  try {
    await fetch('/api/analytics/ingest/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: 'include',
    });
    lastSentUrl = currentUrl;
  } catch (_) {
    // swallow errors – analytics must not break UX
  } finally {
    inflight = false;
  }
}
