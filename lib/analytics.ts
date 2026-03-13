"use client";

import { useEffect, useState } from 'react';

import {
  dispatchPatriEvent,
  getStoredPatriEvents,
  onPatriEvent,
  type PatriEvent,
  type PatriEventType,
} from '@/lib/events';

export function trackPatriAction(type: PatriEventType, detail: Omit<PatriEvent, 'type' | 'timestamp'> = {}) {
  dispatchPatriEvent({ type, ...detail });
}

export function usePatriEventHistory() {
  const [events, setEvents] = useState<PatriEvent[]>([]);

  useEffect(() => {
    setEvents(getStoredPatriEvents());

    return onPatriEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 100));
    });
  }, []);

  return events;
}