"use client";

import { useMemo } from 'react';

import AdminEventFeed from '@/components/AdminEventFeed';
import AiAgent from '@/components/AiAgent';
import PixelCard from '@/components/PixelCard';
import { deriveAdminStats } from '@/lib/adminStats';
import { usePatriEventHistory } from '@/lib/analytics';

export default function AdminPage() {
  const events = usePatriEventHistory();

  const stats = useMemo(() => deriveAdminStats(events), [events]);

  return (
    <div className="space-y-6">
      <h1 className="text-5xl text-[var(--accent2)] md:text-6xl">Admin Console</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <PixelCard title="Total Tokens Spent">
          <p className="text-4xl text-[var(--accent)]">{stats.tokensSpent}</p>
        </PixelCard>
        <PixelCard title="Most Placed Item">
          <p className="text-2xl text-zinc-100">{stats.mostPlacedItem}</p>
        </PixelCard>
        <PixelCard title="Loot Rolls by Rarity">
          <p className="text-2xl text-zinc-100">{stats.rarityText}</p>
        </PixelCard>
      </section>

      <AdminEventFeed />

      <AiAgent role="admin" />
    </div>
  );
}
