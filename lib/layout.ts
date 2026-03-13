type GridItem = {
  instanceId: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

type GridRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function withinBounds(rect: GridRect, gridSize: number): boolean {
  return rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= gridSize && rect.y + rect.h <= gridSize;
}

function intersects(a: GridRect, b: GridRect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function hasCollision(items: GridItem[], candidate: GridRect, ignoreInstanceId?: string): boolean {
  return items.some((item) => {
    if (ignoreInstanceId && item.instanceId === ignoreInstanceId) {
      return false;
    }

    return intersects(candidate, item);
  });
}

export function canPlaceItem(
  items: GridItem[],
  candidate: GridRect,
  gridSize: number,
  ignoreInstanceId?: string,
): boolean {
  return withinBounds(candidate, gridSize) && !hasCollision(items, candidate, ignoreInstanceId);
}

export function findFirstAvailableSpot(
  items: GridItem[],
  dims: Pick<GridRect, 'w' | 'h'>,
  gridSize: number,
): Pick<GridRect, 'x' | 'y'> | null {
  for (let y = 0; y <= gridSize - dims.h; y += 1) {
    for (let x = 0; x <= gridSize - dims.w; x += 1) {
      if (canPlaceItem(items, { x, y, w: dims.w, h: dims.h }, gridSize)) {
        return { x, y };
      }
    }
  }

  return null;
}
