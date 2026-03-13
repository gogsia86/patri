// @vitest-environment jsdom

import { DEFAULT_TOKENS, STORAGE_KEYS } from '@/lib/constants';
import { deductTokens, getTokens, safeStorageGet, safeStorageSet, setTokens } from '@/lib/storage';

describe('storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists and loads room layout state', () => {
    const layout = [{ instanceId: 'x', x: 1, y: 2, w: 1, h: 1 }];

    safeStorageSet(STORAGE_KEYS.layout, layout);
    const loaded = safeStorageGet<typeof layout>(STORAGE_KEYS.layout, []);

    expect(loaded).toEqual(layout);
  });

  it('deducts tokens when balance is sufficient', () => {
    setTokens(500);
    const result = deductTokens(100);

    expect(result.ok).toBe(true);
    expect(result.balance).toBe(400);
    expect(getTokens()).toBe(400);
  });

  it('does not deduct tokens when balance is insufficient', () => {
    setTokens(50);
    const result = deductTokens(100);

    expect(result.ok).toBe(false);
    expect(result.balance).toBe(50);
    expect(getTokens()).toBe(50);
  });

  it('falls back to default tokens with empty storage', () => {
    expect(getTokens()).toBe(DEFAULT_TOKENS);
  });
});
