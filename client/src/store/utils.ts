import { atom } from 'recoil';

// Improved helper function to create atoms with localStorage
export function atomWithLocalStorage<T>(key: string, defaultValue: T) {
  return atom<T>({
    key,
    default: defaultValue,
    effects_UNSTABLE: [
      ({ setSelf, onSet }) => {
        try {
          const savedValue = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
          if (savedValue !== null) {
            try {
              // First try JSON parse
              const parsedValue = JSON.parse(savedValue);
              setSelf(parsedValue);
            } catch (e) {
              // Fallbacks for primitive non-JSON values (e.g., "de")
              const typeOfDefault = typeof defaultValue as string;
              let coerced: unknown = savedValue;
              if (typeOfDefault === 'number') {
                const n = Number(savedValue);
                coerced = Number.isNaN(n) ? defaultValue : n;
              } else if (typeOfDefault === 'boolean') {
                coerced =
                  savedValue === 'true' ? true : savedValue === 'false' ? false : defaultValue;
              } else if (typeOfDefault === 'string') {
                coerced = savedValue;
              } else {
                // Unknown complex type: keep default and repair storage

                console.error(
                  `Error parsing localStorage key "${key}", savedValue: ${savedValue}, falling back to default`,
                  e,
                );
                localStorage.setItem(key, JSON.stringify(defaultValue));
                coerced = defaultValue;
              }
              setSelf(coerced as T);
            }
          }
        } catch (err) {
          // Accessing localStorage might fail in some environments; ignore and use default
        }

        onSet((newValue: T) => {
          try {
            localStorage.setItem(key, JSON.stringify(newValue));
          } catch {
            // ignore write errors (e.g., private mode)
          }
        });
      },
    ],
  });
}
