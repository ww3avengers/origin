/**
 * i18n Helpers: sichere Wrapper für t() Rückgaben
 * Vermeiden unsicherer Casts und liefern robuste Fallbacks.
 */

export type TFunc = (key: string, opts?: Record<string, unknown>) => unknown;

/**
 * Erzwingt eine String-Rückgabe. Wenn der Wert kein String ist, wird fallback verwendet (Default: '').
 */
export const tString = (
  t: TFunc,
  key: string,
  opts?: Record<string, unknown>,
  fallback = '',
): string => {
  const v = t(key, opts) as unknown;
  return typeof v === 'string' ? v : fallback;
};

/**
 * Erwartet ein Array aus Strings. Falls nicht vorhanden/typ-inkorrekt, wird [] zurückgegeben.
 */
export const tArray = (t: TFunc, key: string, opts?: Record<string, unknown>): string[] => {
  const v = t(key, { ...opts, returnObjects: true }) as unknown;
  return Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : [];
};

/**
 * Erwartet ein Objekt mit string Werten. Nicht-String-Werte werden herausgefiltert. Typ-inkorrekt => {}.
 */
export const tRecord = (
  t: TFunc,
  key: string,
  opts?: Record<string, unknown>,
): Record<string, string> => {
  const v = t(key, { ...opts, returnObjects: true }) as unknown;
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const entries = Object.entries(v as Record<string, unknown>).filter(
      ([, val]) => typeof val === 'string',
    );
    return Object.fromEntries(entries) as Record<string, string>;
  }
  return {};
};
