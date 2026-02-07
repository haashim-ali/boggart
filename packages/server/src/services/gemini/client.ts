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

export async function condenseBatch(
  client: Anthropic,
  dataType: string,
  items: string[],
): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a person's ${dataType} to build a psychological profile. Extract and preserve:
- Specific names, relationships, and how they interact with each person
- Topics, interests, and passions with concrete examples
- Personality signals: tone, humor, formality, emotional patterns
- Behavioral patterns: habits, routines, decision-making style
- Values and priorities revealed by their choices
- Any unusual, distinctive, or deeply personal details

Be thorough. Preserve specific details and examples — don't just list themes. The goal is to understand WHO this person is.

Data:\n\n${items.join('\n')}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return block.text.trim();
}
