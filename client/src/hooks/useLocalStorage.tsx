/* `useLocalStorage`
 *
 * Features:
 *  - JSON serializing
 *  - Cross-tab sync via `storage` event
 *  - Optional global state callback (for recoil/zustand sync)
 *  - Optional storageCondition to gate writes
 */

import { useEffect, useMemo, useState } from 'react';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw || raw === 'undefined') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  globalSetState?: (value: T) => void,
  storageCondition?: (value: T, rawCurrentValue?: string | null) => boolean,
): [T, (value: T) => void] {
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const initial = useMemo(
    () => (isBrowser ? safeParse<T>(localStorage.getItem(key), defaultValue) : defaultValue),
    [isBrowser, key, defaultValue],
  );
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (!isBrowser) return;
    const existing = localStorage.getItem(key);
    const shouldSeed = () => {
      if (!existing && !storageCondition) return true;
      if (!existing && storageCondition) return storageCondition(defaultValue);
      return false;
    };
    if (shouldSeed()) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }
    const initialValue = safeParse<T>(existing, defaultValue);
    setValue(initialValue);
    globalSetState?.(initialValue);

    function handler(e: StorageEvent) {
      if (e.key !== key) return;
      const lsi = localStorage.getItem(key);
      setValue(safeParse<T>(lsi, defaultValue));
    }

    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [isBrowser, key, defaultValue, globalSetState, storageCondition]);

  const setValueWrap = (next: T) => {
    try {
      setValue(next);
      if (!isBrowser) return;
      const write = () => {
        localStorage.setItem(key, JSON.stringify(next));
        // notify same-tab listeners that rely on storage event semantics
        window.dispatchEvent(new StorageEvent('storage', { key }));
      };
      if (!storageCondition) {
        write();
      } else if (storageCondition(next, localStorage.getItem(key))) {
        write();
      }
      globalSetState?.(next);
    } catch (e) {
      console.error(e);
    }
  };

  return [value, setValueWrap];
}
