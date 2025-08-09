/*
  Sync-Check für Locale-Dateien zwischen:
  - client/src/locales/
  - packages/client/src/locales/

  Verwendung:
    bun config/translations/check-sync.ts

  Exit Codes:
    0 = alles konsistent
    1 = Abweichungen gefunden
*/

import fs from 'fs';
import path from 'path';

const APP_LOCALES = path.resolve('client/src/locales');
const PKG_LOCALES = path.resolve('packages/client/src/locales');
const FILE_NAME = 'translation.json';

function readJsonSafe(filePath: string): Record<string, unknown> | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (e) {
    return null;
  }
}

function getLanguages(baseDir: string): string[] {
  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((lang) => fs.existsSync(path.join(baseDir, lang, FILE_NAME)));
}

function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix].filter(Boolean);
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const nextPrefix = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      const nested = flattenKeys(v, nextPrefix);
      keys.push(...nested);
    } else {
      keys.push(nextPrefix);
    }
  }
  return keys.sort();
}

function diff<T>(a: Set<T>, b: Set<T>): { onlyA: T[]; onlyB: T[] } {
  const onlyA: T[] = [];
  const onlyB: T[] = [];
  for (const x of a) if (!b.has(x)) onlyA.push(x);
  for (const y of b) if (!a.has(y)) onlyB.push(y);
  return { onlyA: onlyA.sort() as T[], onlyB: onlyB.sort() as T[] };
}

function compareLang(appDir: string, pkgDir: string, lang: string) {
  const appPath = path.join(appDir, lang, FILE_NAME);
  const pkgPath = path.join(pkgDir, lang, FILE_NAME);
  const appJson = readJsonSafe(appPath);
  const pkgJson = readJsonSafe(pkgPath);

  if (!appJson || !pkgJson) {
    return {
      lang,
      status: 'missing' as const,
      appExists: Boolean(appJson),
      pkgExists: Boolean(pkgJson),
    };
  }

  const appKeys = new Set(flattenKeys(appJson));
  const pkgKeys = new Set(flattenKeys(pkgJson));
  const { onlyA: onlyApp, onlyB: onlyPkg } = diff(appKeys, pkgKeys);

  return {
    lang,
    status: onlyApp.length === 0 && onlyPkg.length === 0 ? ('equal' as const) : ('diff' as const),
    onlyInApp: onlyApp,
    onlyInPkg: onlyPkg,
  };
}

function main() {
  const appLangs = new Set(getLanguages(APP_LOCALES));
  const pkgLangs = new Set(getLanguages(PKG_LOCALES));

  const { onlyA: onlyInApp, onlyB: onlyInPkg } = diff(appLangs, pkgLangs);

  const allLangs = new Set<string>([...appLangs, ...pkgLangs]);
  const results: Array<
    | { lang: string; status: 'missing'; appExists: boolean; pkgExists: boolean }
    | { lang: string; status: 'diff' | 'equal'; onlyInApp?: string[]; onlyInPkg?: string[] }
  > = [];

  for (const lang of Array.from(allLangs).sort()) {
    results.push(compareLang(APP_LOCALES, PKG_LOCALES, lang));
  }

  // Reporting
  let hasIssues = false;
  const lines: string[] = [];

  if (onlyInApp.length || onlyInPkg.length) {
    hasIssues = true;
    lines.push('Languages mismatch:');
    if (onlyInApp.length) lines.push(`  Only in app: ${onlyInApp.join(', ')}`);
    if (onlyInPkg.length) lines.push(`  Only in package: ${onlyInPkg.join(', ')}`);
    lines.push('');
  }

  for (const r of results) {
    if (r.status === 'missing') {
      hasIssues = true;
      lines.push(`Missing file for '${r.lang}': app=${r.appExists}, pkg=${r.pkgExists}`);
      continue;
    }
    if (r.status === 'diff') {
      hasIssues = true;
      lines.push(`Key diff for '${r.lang}':`);
      if (r.onlyInApp?.length) lines.push(`  Only in app (${r.onlyInApp.length}): ${r.onlyInApp.join(', ')}`);
      if (r.onlyInPkg?.length) lines.push(`  Only in package (${r.onlyInPkg.length}): ${r.onlyInPkg.join(', ')}`);
      lines.push('');
    }
  }

  if (!hasIssues) {
    lines.push('Locales are in sync between app and package.');
  }

  const output = lines.join('\n');
  console.log(output);
  process.exit(hasIssues ? 1 : 0);
}

main();
