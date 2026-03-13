import { streamText, type ModelMessage } from 'ai';
import { z } from 'zod';

import { getOllamaModel } from '@/lib/ollama';

export const runtime = 'nodejs';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

const bodySchema = z.object({
  messages: z.array(messageSchema),
  role: z.enum(['user', 'admin']),
  eventSummary: z.string().optional(),
});

const SYSTEM_PROMPTS = {
  user: 'You are The Architect, a helpful pixel-RPG interior design guide and site navigator. Short, atmospheric, actionable replies.',
  admin:
    'You are Patri\'s Business AI. Use event summaries to propose monetization, catalog changes, and UX improvements. Be direct and practical.',
} as const;

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      {
        error: 'Invalid request body.',
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { messages, role, eventSummary } = parsed.data;

  const normalizedMessages: ModelMessage[] = messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const systemPrompt =
    role === 'admin' && eventSummary
      ? `${SYSTEM_PROMPTS.admin}\n\nRecent events: ${eventSummary}`
      : SYSTEM_PROMPTS[role];

  const result = streamText({
    model: getOllamaModel(),
    system: systemPrompt,
    messages: normalizedMessages,
  });

  return result.toUIMessageStreamResponse();
}
