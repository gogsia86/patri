import { createOllama } from 'ai-sdk-ollama';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.1';

function normalizeOllamaBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
}

const ollama = createOllama({
  baseURL: normalizeOllamaBaseUrl(OLLAMA_BASE_URL),
});

export function getOllamaModel() {
  return ollama(OLLAMA_MODEL);
}

export { OLLAMA_BASE_URL, OLLAMA_MODEL };