const mocks = vi.hoisted(() => {
  const mockToUIMessageStreamResponse = vi.fn(() => new Response('stream-ok', { status: 200 }));
  const mockStreamText = vi.fn(() => ({
    toUIMessageStreamResponse: mockToUIMessageStreamResponse,
  }));
  const mockGetOllamaModel = vi.fn(() => 'mock-model');

  return {
    mockToUIMessageStreamResponse,
    mockStreamText,
    mockGetOllamaModel,
  };
});

vi.mock('ai', () => ({
  streamText: mocks.mockStreamText,
}));

vi.mock('@/lib/ollama', () => ({
  getOllamaModel: mocks.mockGetOllamaModel,
}));

import { POST } from '@/app/api/chat/route';

describe('/api/chat route', () => {
  beforeEach(() => {
    mocks.mockStreamText.mockClear();
    mocks.mockToUIMessageStreamResponse.mockClear();
    mocks.mockGetOllamaModel.mockClear();
  });

  it('returns 400 for invalid payload', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ role: 'user' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(mocks.mockStreamText).not.toHaveBeenCalled();
  });

  it('calls streamText with user system prompt', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        messages: [{ role: 'user', content: 'hello' }],
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.mockStreamText).toHaveBeenCalledTimes(1);

    const args = mocks.mockStreamText.mock.calls[0]?.[0];
    expect(args.model).toBe('mock-model');
    expect(args.system).toContain('You are The Architect');
    expect(args.system).not.toContain('Recent events:');
    expect(args.messages).toEqual([{ role: 'user', content: 'hello' }]);
  });

  it('injects admin event summary into system prompt', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        role: 'admin',
        eventSummary: 'User placed Gothic Sofa at (2,3)',
        messages: [{ role: 'user', content: 'What should we improve?' }],
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mocks.mockStreamText).toHaveBeenCalledTimes(1);

    const args = mocks.mockStreamText.mock.calls[0]?.[0];
    expect(args.system).toContain("You are Patri's Business AI");
    expect(args.system).toContain('Recent events: User placed Gothic Sofa at (2,3)');
  });
});
