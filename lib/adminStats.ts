import type { PatriEvent } from '@/lib/events';

export type AdminStats = {
  tokensSpent: number;
  mostPlacedItem: string;
  rarityText: string;
};

export function deriveAdminStats(events: PatriEvent[]): AdminStats {
  const allLootRolls = events.filter((event) => event.type === 'LOOT_ROLLED');
  const tokensSpent = allLootRolls.length * 100;

  const placedItems = events.filter((event) => event.type === 'ITEM_PLACED' && event.name);
  const placementsByItem = placedItems.reduce<Record<string, number>>((acc, event) => {
    const itemName = event.name ?? 'Unknown Item';
    acc[itemName] = (acc[itemName] ?? 0) + 1;
    return acc;
  }, {});

  const mostPlacedItem =
    Object.entries(placementsByItem).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No placements yet';

  const rarityCounts = events
    .filter((event) => event.type === 'LOOT_ROLLED' && event.rarity)
    .reduce(
      (acc, event) => {
        const rarity = event.rarity ?? 'common';
        acc[rarity] = (acc[rarity] ?? 0) + 1;
        return acc;
      },
      { common: 0, rare: 0, legendary: 0 } as Record<string, number>,
    );

  return {
    tokensSpent,
    mostPlacedItem,
    rarityText: `C:${rarityCounts.common} / R:${rarityCounts.rare} / L:${rarityCounts.legendary}`,
  };
}
