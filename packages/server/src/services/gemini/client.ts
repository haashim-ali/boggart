import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config';

export function createClient(): Anthropic {
  return new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
}

export async function generateJSON<T>(
  client: Anthropic,
  prompt: string,
  model?: string,
): Promise<T> {
  const response = await client.messages.create({
    model: model ?? 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt + '\n\nRespond with ONLY valid JSON, no markdown fences or extra text.',
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const text = block.text.trim();
  // Strip markdown fences if model wraps output
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(cleaned) as T;
}
