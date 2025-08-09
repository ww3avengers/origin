/*
  Auto-Sync der Locale-Dateien zwischen App und Package.

  Best Practices:
  - Eine führende Quelle: standardmäßig App => Package (client -> packages/client)
  - Additiv: fehlende Keys werden im Ziel ergänzt (mit "" als Placeholder)
  - Keine stillen Löschungen (kein Prune); optional zukünftig via Flag
  - Dry-Run per Default; Schreiben nur mit --write

  Nutzung:
    bun config/translations/sync-locales.ts --direction app->pkg        # Dry-Run
    bun config/translations/sync-locales.ts --direction app->pkg --write # Anwenden

    bun config/translations/sync-locales.ts --direction pkg->app         # Dry-Run

  Exit Codes:
    0 = nichts zu tun / erfolgreich synchron
    1 = Änderungen nötig (Dry-Run) oder Fehler
*/

import fs from 'fs';
import path from 'path';

const APP_LOCALES = path.resolve('client/src/locales');
const PKG_LOCALES = path.resolve('packages/client/src/locales');
const FILE_NAME = 'translation.json';

// Feature flag: strict array fill (coerce container types when numeric path segments are expected)
const STRICT_ARRAY_FILL = process.argv.includes('--strict-array-fill');

function parseArgs() {
  const args = process.argv.slice(2);
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      if (typeof v === 'string') flags[k.slice(2)] = v;
      else if (args[i + 1] && !args[i + 1].startsWith('--')) {
        flags[k.slice(2)] = args[i + 1];
        i++;
      } else {
        flags[k.slice(2)] = true;
      }
    }
  }
  return flags as {
    direction?: 'app->pkg' | 'pkg->app';
    write?: boolean | string;
    baseline?: string;
    prune?: boolean | string;
  };
}

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

function setByPath(obj: any, keyPath: string, value: unknown) {
  const parts = keyPath.split('.');
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = parts[i + 1];
    const isNextIndex = next !== undefined && /^\d+$/.test(next);
    if (cur[p] === undefined || cur[p] === null || typeof cur[p] !== 'object') {
      cur[p] = isNextIndex ? [] : {};
    } else if (STRICT_ARRAY_FILL && isNextIndex && !Array.isArray(cur[p])) {
      // Coerce existing non-array container to array if strict mode expects an array next
      cur[p] = [];
    }
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (/^\d+$/.test(last)) {
    if (!Array.isArray(cur) && STRICT_ARRAY_FILL) {
      // If strict mode and container at last is not array, try to convert if possible
      // Note: caller passes the container by reference; create numeric properties fallback otherwise
    }
    if (Array.isArray(cur)) {
      cur[Number(last)] = value;
    } else {
      // Fallback: assign numeric key on object if not an array
      (cur as any)[last] = value;
    }
  } else {
    (cur as any)[last] = value;
  }
}

function getByPath(obj: any, keyPath: string): unknown {
  return keyPath.split('.').reduce((acc: any, k) => (acc ? acc[k] : undefined), obj);
}

function deleteByPath(obj: any, keyPath: string) {
  const parts = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== 'object' || cur[p] === null) return; // nothing to delete
    cur = cur[p];
  }
  delete cur[parts[parts.length - 1]];
}

function diff<T>(a: Set<T>, b: Set<T>): { onlyA: T[]; onlyB: T[] } {
  const onlyA: T[] = [];
  const onlyB: T[] = [];
  for (const x of a) if (!b.has(x)) onlyA.push(x);
  for (const y of b) if (!a.has(y)) onlyB.push(y);
  return { onlyA: onlyA.sort() as T[], onlyB: onlyB.sort() as T[] };
}

function main() {
  const { direction = 'app->pkg', write, baseline = 'en', prune } = parseArgs();
  const SRC = direction === 'app->pkg' ? APP_LOCALES : PKG_LOCALES;
  const DST = direction === 'app->pkg' ? PKG_LOCALES : APP_LOCALES;

  const srcLangs = new Set(getLanguages(SRC));
  const dstLangs = new Set(getLanguages(DST));

  const { onlyA: langsOnlySrc } = diff(srcLangs, dstLangs);
  const allLangs = new Set<string>([...srcLangs, ...dstLangs]);

  let changes = 0;
  const plan: string[] = [];

  // Sprachen, die im Ziel komplett fehlen
  for (const lang of langsOnlySrc) {
    plan.push(`[add-lang] ${lang} -> ${path.relative(process.cwd(), path.join(DST, lang))}`);
    if (write) {
      fs.mkdirSync(path.join(DST, lang), { recursive: true });
      const srcObj = readJsonSafe(path.join(SRC, lang, FILE_NAME)) || {};
      fs.writeFileSync(path.join(DST, lang, FILE_NAME), JSON.stringify(srcObj, null, 2) + '\n', 'utf8');
    }
    changes++;
  }

  // Key-Level Sync
  for (const lang of Array.from(allLangs).sort()) {
    const srcPath = path.join(SRC, lang, FILE_NAME);
    const dstPath = path.join(DST, lang, FILE_NAME);

    const srcJson = readJsonSafe(srcPath);
    const dstJson = readJsonSafe(dstPath);

    if (!srcJson || !dstJson) continue; // nur vergleichen, wenn beide existieren

    const srcKeys = new Set(flattenKeys(srcJson));
    const dstKeys = new Set(flattenKeys(dstJson));

    const { onlyA: missingInDst, onlyB: extraInDst } = diff(srcKeys, dstKeys);

    if (missingInDst.length) {
      plan.push(`[add-keys] ${lang}: ${missingInDst.length} keys missing in target`);
      if (write) {
        // Füge fehlende Keys mit leeren Strings ein
        for (const k of missingInDst) {
          const val = getByPath(srcJson, k);
          setByPath(dstJson, k, typeof val === 'object' && val !== null ? '' : '');
        }
        fs.writeFileSync(dstPath, JSON.stringify(dstJson, null, 2) + '\n', 'utf8');
      }
      changes += missingInDst.length;
    }

    // Optional: Prune extra keys present only in destination
    const doPrune = prune === true || prune === 'true' || prune === '';
    if (doPrune && extraInDst.length) {
      plan.push(`[prune-keys] ${lang}: ${extraInDst.length} extra keys to remove from target`);
      if (write) {
        // Backup once per language before destructive change
        const backupPath = `${dstPath}.bak`;
        try {
          if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(dstPath, backupPath);
          }
        } catch {}
        for (const k of extraInDst) {
          deleteByPath(dstJson, k);
        }
        fs.writeFileSync(dstPath, JSON.stringify(dstJson, null, 2) + '\n', 'utf8');
      }
      changes += extraInDst.length;
    }
  }

  if (changes === 0) {
    console.log('Locales are already in sync.');
    process.exit(0);
  }

  console.log(plan.join('\n'));
  if (!write) {
    console.log('\nDry-Run complete. Re-run with --write to apply changes.');
    process.exit(1);
  } else {
    console.log('\nApplied sync successfully.');
    process.exit(0);
  }
}

main();
