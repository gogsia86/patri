import { deriveAdminStats } from '@/lib/adminStats';
import type { PatriEvent } from '@/lib/events';

describe('deriveAdminStats', () => {
  it('computes token spend, top placement, and rarity distribution', () => {
    const events: PatriEvent[] = [
      {
        type: 'LOOT_ROLLED',
        timestamp: '2026-03-13T09:00:00.000Z',
        rarity: 'legendary',
        itemName: 'Void Throne',
      },
      {
        type: 'LOOT_ROLLED',
        timestamp: '2026-03-13T08:00:00.000Z',
        rarity: 'rare',
        itemName: 'Iron Chandelier',
      },
      {
        type: 'LOOT_ROLLED',
        timestamp: '2026-03-12T08:00:00.000Z',
        rarity: 'common',
        itemName: 'Worn Rug',
      },
      {
        type: 'ITEM_PLACED',
        timestamp: '2026-03-13T08:05:00.000Z',
        name: 'Gothic Sofa',
      },
      {
        type: 'ITEM_PLACED',
        timestamp: '2026-03-13T08:10:00.000Z',
        name: 'Gothic Sofa',
      },
      {
        type: 'ITEM_PLACED',
        timestamp: '2026-03-13T08:20:00.000Z',
        name: 'Neon Arcade Cabinet',
      },
    ];

    const stats = deriveAdminStats(events);

    expect(stats.tokensSpent).toBe(300);
    expect(stats.mostPlacedItem).toBe('Gothic Sofa');
    expect(stats.rarityText).toBe('C:1 / R:1 / L:1');
  });
});
