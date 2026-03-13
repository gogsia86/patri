"use client";

import { useEffect, useState } from 'react';

import PixelCard from '@/components/PixelCard';
import { getStoredPatriEvents, onPatriEvent, type PatriEvent } from '@/lib/events';

function eventLabel(event: PatriEvent) {
  if (event.type === 'ITEM_PLACED') {
    return `ITEM_PLACED ${event.name ?? ''} @ (${event.x ?? '-'}, ${event.y ?? '-'})`;
  }
  if (event.type === 'ITEM_REMOVED') {
    return `ITEM_REMOVED ${event.name ?? ''}`;
  }
  return `LOOT_ROLLED ${event.itemName ?? ''} [${event.rarity ?? 'common'}]`;
}

export default function AdminEventFeed() {
  const [events, setEvents] = useState<PatriEvent[]>([]);

  useEffect(() => {
    setEvents(getStoredPatriEvents());

    return onPatriEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 100));
    });
  }, []);

  return (
    <PixelCard title="Live Event Feed">
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {events.length === 0 ? <p className="text-zinc-400">No events yet.</p> : null}
        {events.map((event, index) => (
          <div key={`${event.timestamp}-${index}`} className="px-border bg-zinc-900/80 px-3 py-2">
            <p className="text-[var(--termGreen)]">{eventLabel(event)}</p>
            <p className="text-sm text-zinc-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
