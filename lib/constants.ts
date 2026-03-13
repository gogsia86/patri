export const STORAGE_KEYS = {
  layout: 'patri.layout.v1',
  tokens: 'patri.tokens.v1',
  events: 'patri.events.v1',
  eventsBroadcast: 'patri.events.broadcast.v1',
} as const;

export type FurnitureRarity = 'common' | 'rare' | 'legendary';

export type FurnitureItem = {
  id: string;
  name: string;
  rarity: FurnitureRarity;
  size: {
    width: number;
    height: number;
  };
  emoji: string;
};

/**
 * Starter furniture catalog for the room palette.
 */
export const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'gothic-sofa',
    name: 'Gothic Sofa',
    rarity: 'common',
    size: { width: 1, height: 1 },
    emoji: '🛋️',
  },
  {
    id: 'iron-chandelier',
    name: 'Iron Chandelier',
    rarity: 'rare',
    size: { width: 1, height: 1 },
    emoji: '💡',
  },
  {
    id: 'cursed-mirror',
    name: 'Cursed Mirror',
    rarity: 'legendary',
    size: { width: 1, height: 1 },
    emoji: '🪞',
  },
  {
    id: 'void-throne',
    name: 'Void Throne',
    rarity: 'legendary',
    size: { width: 1, height: 1 },
    emoji: '🪑',
  },
  {
    id: 'worn-rug',
    name: 'Worn Rug',
    rarity: 'common',
    size: { width: 1, height: 1 },
    emoji: '🧶',
  },
  {
    id: 'neon-arcade-cabinet',
    name: 'Neon Arcade Cabinet',
    rarity: 'rare',
    size: { width: 1, height: 1 },
    emoji: '🕹️',
  },
];

export const ROOM_CONFIG = {
  gridSize: 10,
  tileWidth: 80,
  tileHeight: 40,
} as const;

export const LOOT_ROLL_COST = 100;
export const DEFAULT_TOKENS = 500;