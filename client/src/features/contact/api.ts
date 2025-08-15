export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  source?: string;
  website?: string; // honeypot
};

export async function submitContact(payload: ContactPayload): Promise<{ ok: boolean }>;
export async function submitContact(
  payload: ContactPayload,
  opts?: { signal?: AbortSignal },
): Promise<{ ok: boolean }>;
export async function submitContact(
  payload: ContactPayload,
  opts: { signal?: AbortSignal } = {},
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: opts.signal,
      credentials: 'include',
    });
    if (!res.ok) return { ok: false };
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
