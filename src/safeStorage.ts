/**
 * Safe localStorage wrapper with try/catch and in-memory fallback.
 * Prevents DOMException/SecurityError in restricted environments (sandboxed iframes, private browsing).
 */

const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // SecurityError or localStorage blocked
    }
    return memoryStore.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      // SecurityError or quota exceeded
    }
    memoryStore.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
    memoryStore.delete(key);
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.clear();
      }
    } catch (e) {}
    memoryStore.clear();
  }
};

export default safeStorage;
