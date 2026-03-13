"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import PixelButton from '@/components/PixelButton';
import PixelCard from '@/components/PixelCard';
import { FURNITURE_ITEMS, STORAGE_KEYS, type FurnitureItem } from '@/lib/constants';
import { dispatchPatriEvent } from '@/lib/events';
import { canPlaceItem, findFirstAvailableSpot } from '@/lib/layout';
import { safeStorageGet, safeStorageSet } from '@/lib/storage';

type PlacedFurniture = FurnitureItem & {
  instanceId: string;
  x: number;
  y: number;
};

type LayoutGridItem = {
  instanceId: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const GRID_SIZE = 10;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const HALF_WIDTH = TILE_WIDTH / 2;
const HALF_HEIGHT = TILE_HEIGHT / 2;

const RARITY_COLORS = {
  common: '#4c4c61',
  rare: '#235f80',
  legendary: '#7a5a21',
} as const;

const DEFAULT_TEMPLATE: FurnitureItem = FURNITURE_ITEMS[0] ?? {
  id: 'fallback-seat',
  name: 'Fallback Seat',
  rarity: 'common',
  size: { width: 1, height: 1 },
  emoji: '🪑',
};

function projectTile(x: number, y: number, originX: number, originY: number) {
  return {
    screenX: Math.round((x - y) * HALF_WIDTH + originX),
    screenY: Math.round((x + y) * HALF_HEIGHT + originY),
  };
}

function unprojectTile(screenX: number, screenY: number, originX: number, originY: number) {
  const a = (screenX - originX) / HALF_WIDTH;
  const b = (screenY - originY) / HALF_HEIGHT;

  return {
    x: Math.round((a + b) / 2),
    y: Math.round((b - a) / 2),
  };
}

function normalizeStoredLayout(layout: unknown): PlacedFurniture[] {
  if (!Array.isArray(layout)) {
    return [];
  }

  const byId = new Map(FURNITURE_ITEMS.map((item) => [item.id, item]));

  return layout
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const raw = entry as {
        id?: string;
        instanceId?: string;
        x?: number;
        y?: number;
      };

      if (!raw.id || !raw.instanceId || typeof raw.x !== 'number' || typeof raw.y !== 'number') {
        return null;
      }

      const catalogItem = byId.get(raw.id);
      if (!catalogItem) {
        return null;
      }

      return {
        ...catalogItem,
        instanceId: raw.instanceId,
        x: raw.x,
        y: raw.y,
      };
    })
    .filter((item): item is PlacedFurniture => item !== null);
}

function toLayoutItems(items: PlacedFurniture[]): LayoutGridItem[] {
  return items.map((item) => ({
    instanceId: item.instanceId,
    x: item.x,
    y: item.y,
    w: item.size.width,
    h: item.size.height,
  }));
}

export default function IsometricRoomGrid() {
  const [items, setItems] = useState<PlacedFurniture[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FurnitureItem>(DEFAULT_TEMPLATE);
  const [status, setStatus] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const layoutItems = useMemo(() => toLayoutItems(items), [items]);

  useEffect(() => {
    const stored = safeStorageGet<unknown>(STORAGE_KEYS.layout, []);
    setItems(normalizeStoredLayout(stored));
  }, []);

  const board = useMemo(() => {
    const width = GRID_SIZE * TILE_WIDTH;
    const height = GRID_SIZE * TILE_HEIGHT;

    return {
      width,
      height,
      originX: Math.round(width / 2),
      originY: TILE_HEIGHT,
    };
  }, []);

  const persistLayout = (next: PlacedFurniture[]) => {
    setItems(next);
    safeStorageSet(STORAGE_KEYS.layout, next);
  };

  const addItem = () => {
    const available = findFirstAvailableSpot(
      layoutItems,
      { w: selectedTemplate.size.width, h: selectedTemplate.size.height },
      GRID_SIZE,
    );

    if (!available) {
      setStatus('No valid tile available for this furniture.');
      return;
    }

    const instanceId = `${selectedTemplate.id}-${Date.now()}`;
    const candidate: PlacedFurniture = {
      ...selectedTemplate,
      instanceId,
      x: available.x,
      y: available.y,
    };

    const next = [candidate, ...items];
    persistLayout(next);
    setStatus(`${candidate.name} added at (${candidate.x}, ${candidate.y})`);
    dispatchPatriEvent({
      type: 'ITEM_PLACED',
      itemId: candidate.id,
      name: candidate.name,
      x: candidate.x,
      y: candidate.y,
    });
  };

  const removeItem = (instanceId: string) => {
    const existing = items.find((item) => item.instanceId === instanceId);
    const next = items.filter((item) => item.instanceId !== instanceId);
    persistLayout(next);

    if (existing) {
      dispatchPatriEvent({
        type: 'ITEM_REMOVED',
        itemId: existing.id,
        name: existing.name,
        x: existing.x,
        y: existing.y,
      });
    }
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="px-panel p-4">
        <h3 className="mb-4 text-2xl text-[var(--accent2)]">Isometric Room Builder</h3>
        <div className="overflow-x-auto pb-2">
          <div
            ref={containerRef}
            className="relative mx-auto h-[376px] w-[640px] min-w-[640px] overflow-hidden rounded-sm bg-[var(--bg0)]"
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const point = projectTile(x, y, board.originX, board.originY);

              return (
                <motion.div
                  key={`tile-${x}-${y}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rotate-45 border border-zinc-700/60 bg-zinc-800/25"
                  style={{
                    left: point.screenX,
                    top: point.screenY,
                    width: TILE_WIDTH,
                    height: TILE_HEIGHT,
                  }}
                />
              );
            })}

            {items.map((item) => {
              const point = projectTile(item.x, item.y, board.originX, board.originY);
              const width = item.size.width * TILE_WIDTH;
              const depth = item.size.height * TILE_HEIGHT;
              const screenX = point.screenX;
              const screenY = point.screenY;
              const zIndex = 100 + item.y;

              return (
                <motion.div
                  key={item.instanceId}
                  drag
                  dragMomentum={false}
                  dragConstraints={containerRef}
                  onDragEnd={(_, info) => {
                    const snapped = unprojectTile(
                      screenX + info.offset.x,
                      screenY + info.offset.y,
                      board.originX,
                      board.originY,
                    );

                    if (
                      !canPlaceItem(
                        layoutItems,
                        { x: snapped.x, y: snapped.y, w: item.size.width, h: item.size.height },
                        GRID_SIZE,
                        item.instanceId,
                      )
                    ) {
                      setStatus(`Invalid placement for ${item.name}; reverted`);
                      return;
                    }

                    const next = items.map((existing) =>
                      existing.instanceId === item.instanceId
                        ? {
                            ...existing,
                            x: snapped.x,
                            y: snapped.y,
                          }
                        : existing,
                    );

                    persistLayout(next);
                    setStatus(`${item.name} placed at (${snapped.x}, ${snapped.y})`);
                    dispatchPatriEvent({
                      type: 'ITEM_PLACED',
                      itemId: item.id,
                      name: item.name,
                      x: snapped.x,
                      y: snapped.y,
                    });
                  }}
                  className="group absolute cursor-grab active:cursor-grabbing"
                  style={{
                    left: screenX,
                    top: screenY - depth,
                    width,
                    height: depth + 24,
                    zIndex,
                  }}
                  whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                  whileDrag={reduceMotion ? undefined : { scale: 1.06 }}
                >
                  <motion.div
                    className="px-border absolute inset-x-0 bottom-0 flex items-center justify-center text-2xl"
                    style={{
                      height: depth + 12,
                      backgroundColor: RARITY_COLORS[item.rarity],
                    }}
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                  </motion.div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.instanceId)}
                    className="px-border absolute -right-2 -top-2 bg-black p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 h-6 text-lg text-[var(--termAmber)]">{status}</p>
      </div>

      <PixelCard title="Furniture Palette" className="h-fit">
        <div className="space-y-3">
          {FURNITURE_ITEMS.map((template) => (
            <button
              type="button"
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`px-border flex w-full items-center justify-between px-3 py-2 text-left ${selectedTemplate.id === template.id ? 'text-[var(--accent)]' : 'text-zinc-300'}`}
              aria-label={`Select ${template.name}`}
            >
              <span className="text-lg">
                {template.emoji} {template.name}
              </span>
              <span className="text-xs uppercase tracking-widest text-zinc-400">{template.rarity}</span>
            </button>
          ))}

          <PixelButton onClick={addItem} aria-label={`Add ${selectedTemplate.name}`} className="w-full">
            Place Selected
          </PixelButton>
        </div>
      </PixelCard>
    </section>
  );
}
