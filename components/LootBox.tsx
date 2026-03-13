"use client";

import confetti from 'canvas-confetti';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

import PixelButton from '@/components/PixelButton';
import PixelCard from '@/components/PixelCard';
import { DEFAULT_TOKENS, LOOT_ROLL_COST } from '@/lib/constants';
import { dispatchPatriEvent } from '@/lib/events';
import { rollLoot } from '@/lib/loot';
import { deductTokens, getTokens } from '@/lib/storage';

export default function LootBox() {
  const [tokens, setTokens] = useState<number>(() => {
    if (typeof globalThis.window === 'undefined') {
      return DEFAULT_TOKENS;
    }

    return getTokens();
  });
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const reduceMotion = useReducedMotion();
  const canRoll = tokens >= LOOT_ROLL_COST && !rolling;
  let chestAnimation: { rotate: number[] | number; scale: number[] | number } | undefined;

  if (!reduceMotion) {
    chestAnimation = rolling ? { rotate: [0, -2, 2, -1, 1, 0], scale: [1, 1.03, 1] } : { rotate: 0, scale: 1 };
  }

  const roll = async () => {
    if (rolling) {
      return;
    }

    setError('');

    if (tokens < LOOT_ROLL_COST) {
      setError('ERR:// NOT_ENOUGH_TOKENS');
      return;
    }

    const tokenResult = deductTokens(LOOT_ROLL_COST);
    setTokens(tokenResult.balance);
    setRolling(true);

    if (!reduceMotion) {
      await new Promise((resolve) => setTimeout(resolve, 850));
    }

    const item = rollLoot();
    const text = `${item.itemName} [${item.rarity.toUpperCase()}]`;
    setResult(text);

    dispatchPatriEvent({
      type: 'LOOT_ROLLED',
      rarity: item.rarity,
      itemName: item.itemName,
    });

    if (item.rarity === 'rare' || item.rarity === 'legendary') {
      confetti({
        particleCount: item.rarity === 'legendary' ? 180 : 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: item.rarity === 'legendary' ? ['#ffe082', '#ffb74d', '#ffd54f'] : ['#56e1ff', '#8ec5ff', '#7ce7ff'],
      });
    }

    setRolling(false);
  };

  return (
    <PixelCard title="Loot Box">
      <p className="text-xl text-zinc-300">Tokens: {tokens}</p>

      <motion.div
        className="px-border mt-4 flex h-28 items-center justify-center bg-zinc-900 text-6xl"
        animate={chestAnimation}
        transition={reduceMotion ? undefined : { duration: 0.7, repeat: rolling ? Infinity : 0 }}
      >
        🎁
      </motion.div>

      <PixelButton
        className="mt-4 w-full"
        onClick={roll}
        disabled={!canRoll}
        loading={rolling}
        aria-label="Roll loot box for 100 tokens"
      >
        Roll (100 tokens)
      </PixelButton>

      {error ? <p className="mt-3 text-lg text-red-400">{error}</p> : null}
      {result ? <p className="mt-3 text-xl text-[var(--termGreen)]">Drop: {result}</p> : null}

      {result.includes('[RARE]') || result.includes('[LEGENDARY]') ? (
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 6 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="px-border mt-3 inline-block bg-zinc-900 px-2 py-1 text-sm uppercase tracking-widest text-[var(--accent2)]"
        >
          Rare Signal Detected
        </motion.div>
      ) : null}
    </PixelCard>
  );
}
