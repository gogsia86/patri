import { STORAGE_KEYS } from '@/lib/constants';
import { safeStorageGet, safeStorageSet } from '@/lib/storage';

export type PatriEventType = 'ITEM_PLACED' | 'ITEM_REMOVED' | 'LOOT_ROLLED';

export type PatriEvent = {
  type: PatriEventType;
  timestamp: string;
  itemId?: string;
  name?: string;
  x?: number;
  y?: number;
  rarity?: 'common' | 'rare' | 'legendary';
  itemName?: string;
};

const EVENT_NAME = 'patri-action';
const MAX_EVENTS = 100;

/**
 * Append an event to stored history while keeping only the latest 100 records.
 */
function appendStoredEvent(event: PatriEvent) {
  const history = safeStorageGet<PatriEvent[]>(STORAGE_KEYS.events, []);
  const next = [event, ...history].slice(0, MAX_EVENTS);
  safeStorageSet(STORAGE_KEYS.events, next);
}

/**
 * Retrieve persisted PATRI event history.
 */
export function getStoredPatriEvents(): PatriEvent[] {
  return safeStorageGet<PatriEvent[]>(STORAGE_KEYS.events, []);
}

/**
 * Dispatch a global PATRI action event and persist it for analytics.
 */
export function dispatchPatriEvent(detail: Omit<PatriEvent, 'timestamp'>) {
  if (globalThis.window === undefined) {
    return;
  }

  const event: PatriEvent = {
    ...detail,
    timestamp: new Date().toISOString(),
  };

  appendStoredEvent(event);

  /**
   * Subscribe to PATRI action events dispatched in the same tab or another tab.
   */
  globalThis.window.dispatchEvent(new CustomEvent<PatriEvent>(EVENT_NAME, { detail: event }));
  safeStorageSet(STORAGE_KEYS.eventsBroadcast, event);
}

export function onPatriEvent(handler: (event: PatriEvent) => void) {
  if (globalThis.window === undefined) {
    return () => undefined;
  }

  const customHandler = (event: Event) => {
    const typed = event as CustomEvent<PatriEvent>;
    if (typed.detail) {
      handler(typed.detail);
    }
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEYS.eventsBroadcast || !event.newValue) {
      return;
    }

    try {
      const parsed = JSON.parse(event.newValue) as PatriEvent;
      handler(parsed);
    } catch {
      return;
    }
  };

  globalThis.window.addEventListener(EVENT_NAME, customHandler as EventListener);
  globalThis.window.addEventListener('storage', storageHandler);

  return () => {
    globalThis.window.removeEventListener(EVENT_NAME, customHandler as EventListener);
    globalThis.window.removeEventListener('storage', storageHandler);
  };
}