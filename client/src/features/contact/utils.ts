import { ContactFormValues } from './schema';

export function getPrefillFromSearch(
  search: string,
): Partial<ContactFormValues> & { source?: string } {
  const params = new URLSearchParams(search);
  return {
    name: params.get('name') || '',
    email: params.get('email') || '',
    company: params.get('company') || '',
    message: params.get('message') || '',
    subject: params.get('subject') || '',
    source: params.get('source') || '',
  };
}

export function buildMailtoHref(
  values: Partial<ContactFormValues> & { to?: string; source?: string },
) {
  const to = values.to || 'contact@sigmacode.ai';
  const subject = values.subject || 'SIGMACODE Demo Request';
  const lines = [
    values.message ? values.message : '',
    '',
    values.name ? `Name: ${values.name}` : '',
    values.email ? `Email: ${values.email}` : '',
    values.company ? `Company: ${values.company}` : '',
    values.source ? `Source: ${values.source}` : '',
  ].filter(Boolean);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

export function isSpam(values: ContactFormValues, elapsedMs: number) {
  // Honeypot und sehr schnelle Submits
  if (values.website && values.website.trim().length > 0) return true;
  if (elapsedMs < 700) return true;
  return false;
}
