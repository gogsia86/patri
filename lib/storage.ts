import { DEFAULT_TOKENS, STORAGE_KEYS } from '@/lib/constants';

/**
 * Read a JSON value from localStorage safely.
 */
export function safeStorageGet<T>(key: string, fallback: T): T {
  if (globalThis.window === undefined) {
    return fallback;
  }

  try {
    const raw = globalThis.window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Persist a JSON value to localStorage safely.
 */
export function safeStorageSet<T>(key: string, value: T) {
  if (globalThis.window === undefined) {
    return;
  }

  try {
    globalThis.window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

/**
 * Remove a localStorage key safely.
 */
export function safeStorageRemove(key: string) {
  if (globalThis.window === undefined) {
    return;
  }

  try {
    globalThis.window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

/**
 * Get the current PATRI token balance.
 */
export function getTokens(): number {
  return safeStorageGet<number>(STORAGE_KEYS.tokens, DEFAULT_TOKENS);
}

/**
 * Save PATRI token balance.
 */
export function setTokens(value: number) {
  safeStorageSet<number>(STORAGE_KEYS.tokens, value);
}

/**
 * Deduct tokens if there is enough balance.
 */
export function deductTokens(amount: number): { ok: boolean; balance: number } {
  const current = getTokens();

  if (amount <= 0) {
    return { ok: true, balance: current };
  }

  if (current < amount) {
    return { ok: false, balance: current };
  }

  const balance = current - amount;
  setTokens(balance);
  return { ok: true, balance };
}