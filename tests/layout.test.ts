import { canPlaceItem, findFirstAvailableSpot } from '@/lib/layout';

describe('layout placement', () => {
  it('blocks overlapping placements', () => {
    const items = [{ instanceId: 'a', x: 0, y: 0, w: 2, h: 1 }];

    const valid = canPlaceItem(items, { x: 2, y: 0, w: 1, h: 1 }, 10);
    const overlap = canPlaceItem(items, { x: 1, y: 0, w: 1, h: 1 }, 10);

    expect(valid).toBe(true);
    expect(overlap).toBe(false);
  });

  it('returns first available tile for new furniture', () => {
    const items = [
      { instanceId: 'a', x: 0, y: 0, w: 1, h: 1 },
      { instanceId: 'b', x: 1, y: 0, w: 1, h: 1 },
      { instanceId: 'c', x: 2, y: 0, w: 1, h: 1 },
    ];

    const spot = findFirstAvailableSpot(items, { w: 1, h: 1 }, 10);

    expect(spot).toEqual({ x: 3, y: 0 });
  });
});
