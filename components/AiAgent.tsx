"use client";

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { SendHorizonal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import PixelButton from '@/components/PixelButton';
import PixelCard from '@/components/PixelCard';
import PixelInput from '@/components/PixelInput';
import { onPatriEvent, type PatriEvent } from '@/lib/events';

type AiAgentRole = 'user' | 'admin';

type AiAgentProps = {
  role: AiAgentRole;
};

type ChatMessage = {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
};

const quickPrompts = ['Suggest a dark living room', 'Optimize layout', 'What\'s trending?', 'Moody lighting ideas'];

function toEventLine(event: PatriEvent) {
  if (event.type === 'ITEM_PLACED') {
    return `ITEM_PLACED ${event.name ?? ''} (${event.x ?? '-'},${event.y ?? '-'})`;
  }

  if (event.type === 'ITEM_REMOVED') {
    return `ITEM_REMOVED ${event.name ?? ''}`;
  }

  return `LOOT_ROLLED ${event.itemName ?? ''} [${event.rarity ?? 'common'}]`;
}

function messageText(parts: Array<{ type: string; text?: string }>) {
  return parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text ?? '')
    .join('');
}

function ChatMessages({ messages, role }: Readonly<{ messages: ChatMessage[]; role: AiAgentRole }>) {
  if (messages.length === 0) {
    return <p className="text-[var(--termGreen)]">{role === 'admin' ? 'Advisor online.' : 'Navigator online.'}</p>;
  }

  return messages.map((message) => (
    <div key={message.id} className="px-border bg-zinc-900/80 p-2">
      <div className="text-xs uppercase text-zinc-500">{message.role}</div>
      <p className={message.role === 'assistant' ? 'text-[var(--termGreen)]' : 'text-[var(--termAmber)]'}>
        {messageText(message.parts)}
      </p>
    </div>
  ));
}

function AdminEventPreview({ eventLines }: Readonly<{ eventLines: string[] }>) {
  if (eventLines.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 border-t border-zinc-700 pt-2 text-xs text-zinc-400">
      {eventLines.slice(0, 5).map((line, idx) => (
        <p key={`${line}-${idx}`}>Event: {line}</p>
      ))}
    </div>
  );
}

type ExpandedPanelProps = {
  role: AiAgentRole;
  reduceMotion: boolean | null;
  messages: ChatMessage[];
  eventLines: string[];
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  onClose: () => void;
  onSend: (value: string) => Promise<void>;
};

function ExpandedArchitectPanel({
  role,
  reduceMotion,
  messages,
  eventLines,
  input,
  isLoading,
  setInput,
  onClose,
  onSend,
}: Readonly<ExpandedPanelProps>) {
  return (
    <motion.div
      key="expanded"
      initial={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.95 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.95 }}
      className="w-[min(360px,calc(100vw-1rem))]"
    >
      <PixelCard padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-zinc-800 px-3 py-2">
          <span className="text-sm uppercase tracking-[0.2em] text-[var(--termGreen)]">The Architect [{role}]</span>
          <button
            type="button"
            className="text-[var(--termAmber)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            onClick={onClose}
            aria-label="Minimize The Architect"
          >
            ─
          </button>
        </div>

        <div className="max-h-72 space-y-3 overflow-y-auto p-3 text-sm">
          <ChatMessages messages={messages} role={role} />
          {role === 'admin' ? <AdminEventPreview eventLines={eventLines} /> : null}
        </div>

        <div className="border-t-2 border-zinc-800 p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="px-border bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:text-[var(--accent2)]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <PixelInput
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void onSend(event.currentTarget.value);
                }
              }}
              disabled={isLoading}
              placeholder={role === 'admin' ? 'Ask for trend insights...' : 'Ask for design advice...'}
              className="flex-1"
              aria-label="Message The Architect"
            />
            <PixelButton
              type="button"
              onClick={() => {
                void onSend(input);
              }}
              disabled={isLoading || input.trim().length === 0}
              className="px-3"
              aria-label="Send message"
            >
              <SendHorizonal size={16} />
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </motion.div>
  );
}

function CollapsedArchitectButton({
  onOpen,
  reduceMotion,
}: Readonly<{ onOpen: () => void; reduceMotion: boolean | null }>) {
  return (
    <motion.button
      key="minimized"
      onClick={onOpen}
      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      className="px-border bg-zinc-900 px-4 py-3 text-2xl"
      aria-label="Open The Architect"
    >
      🤖
    </motion.button>
  );
}

export default function AiAgent({ role }: Readonly<AiAgentProps>) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [eventLines, setEventLines] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();

  const eventSummary = useMemo(() => eventLines.slice(-10).reverse().join(' | '), [eventLines]);

  const { messages, sendMessage: sendChatMessage, status } = useChat();

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    globalThis.addEventListener('keydown', onKeyDown);
    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (role !== 'admin') {
      return;
    }

    return onPatriEvent((event) => {
      const line = toEventLine(event);
      setEventLines((prev) => [line, ...prev].slice(0, 20));
    });
  }, [role]);

  const sendMessage = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setInput('');
    await sendChatMessage(
      {
        text: trimmed,
      },
      {
        body: {
          role,
          eventSummary: role === 'admin' ? eventSummary : undefined,
        },
      },
    );
  };

  return (
    <div className="fixed bottom-2 right-2 z-[60] sm:bottom-4 sm:right-4">
      <AnimatePresence mode="wait">
        {open ? (
          <ExpandedArchitectPanel
            role={role}
            reduceMotion={reduceMotion}
            messages={messages as ChatMessage[]}
            eventLines={eventLines}
            input={input}
            isLoading={isLoading}
            setInput={setInput}
            onClose={() => setOpen(false)}
            onSend={sendMessage}
          />
        ) : (
          <CollapsedArchitectButton onOpen={() => setOpen(true)} reduceMotion={reduceMotion} />
        )}
      </AnimatePresence>
    </div>
  );
}
