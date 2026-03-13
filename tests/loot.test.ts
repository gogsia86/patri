import { FURNITURE_ITEMS } from '@/lib/constants';
import { rollLoot } from '@/lib/loot';

describe('rollLoot', () => {
  it('returns an item name from the same rolled rarity bucket', () => {
    const byRarity = {
      common: new Set(FURNITURE_ITEMS.filter((item) => item.rarity === 'common').map((item) => item.name)),
      rare: new Set(FURNITURE_ITEMS.filter((item) => item.rarity === 'rare').map((item) => item.name)),
      legendary: new Set(FURNITURE_ITEMS.filter((item) => item.rarity === 'legendary').map((item) => item.name)),
    };

    for (let i = 0; i < 200; i += 1) {
      const result = rollLoot();
      expect(byRarity[result.rarity].has(result.itemName)).toBe(true);
    }
  });

  it('roughly follows configured rarity weights over many rolls', () => {
    const iterations = 20000;
    const counts = { common: 0, rare: 0, legendary: 0 };

    for (let i = 0; i < iterations; i += 1) {
      const result = rollLoot();
      counts[result.rarity] += 1;
    }

    const commonRate = counts.common / iterations;
    const rareRate = counts.rare / iterations;
    const legendaryRate = counts.legendary / iterations;

    expect(commonRate).toBeGreaterThan(0.65);
    expect(commonRate).toBeLessThan(0.75);
    expect(rareRate).toBeGreaterThan(0.2);
    expect(rareRate).toBeLessThan(0.3);
    expect(legendaryRate).toBeGreaterThan(0.02);
    expect(legendaryRate).toBeLessThan(0.08);
  });
});
