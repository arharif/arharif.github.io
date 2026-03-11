export const safeStorage = {
  get(key: string, mode: 'local' | 'session' = 'local'): string | null {
    try {
      return mode === 'session' ? sessionStorage.getItem(key) : localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string, mode: 'local' | 'session' = 'local') {
    try {
      if (mode === 'session') sessionStorage.setItem(key, value);
      else localStorage.setItem(key, value);
    } catch {
      /* ignore storage failures */
    }
  },
  remove(key: string, mode: 'local' | 'session' | 'both' = 'local') {
    try {
      if (mode === 'session' || mode === 'both') sessionStorage.removeItem(key);
    } catch {
      /* ignore storage failures */
    }
    try {
      if (mode === 'local' || mode === 'both') localStorage.removeItem(key);
    } catch {
      /* ignore storage failures */
    }
  },
};
