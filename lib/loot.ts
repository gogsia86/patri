import { FURNITURE_ITEMS } from '@/lib/constants';

export type LootRarity = 'common' | 'rare' | 'legendary';

export type LootRollResult = {
  itemName: string;
  rarity: LootRarity;
};

const RARITY_WEIGHTS: Array<{ rarity: LootRarity; weight: number }> = [
  { rarity: 'common', weight: 70 },
  { rarity: 'rare', weight: 25 },
  { rarity: 'legendary', weight: 5 },
];

function rollRarity(): LootRarity {
  const total = RARITY_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  const roll = Math.random() * total;

  let cursor = 0;
  for (const entry of RARITY_WEIGHTS) {
    cursor += entry.weight;
    if (roll <= cursor) {
      return entry.rarity;
    }
  }

  return 'common';
}

function pickItemNameByRarity(rarity: LootRarity): string {
  const options = FURNITURE_ITEMS.filter((item) => item.rarity === rarity);
  if (options.length === 0) {
    return 'Mystery Relic';
  }

  const index = Math.floor(Math.random() * options.length);
  const fallback = options[0];
  return options[index]?.name ?? fallback.name;
}

export function rollLoot(): LootRollResult {
  const rarity = rollRarity();
  return {
    rarity,
    itemName: pickItemNameByRarity(rarity),
  };
}