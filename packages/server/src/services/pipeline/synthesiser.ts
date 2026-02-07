import type { EntityGraph, Profile } from '@boggart/shared';
import { createClient, generateJSON } from '../gemini/client';
import { buildSynthesisPrompt } from '../gemini/prompts';

export async function synthesise(userId: string, graph: EntityGraph): Promise<Profile> {
  const client = createClient();
  const prompt = buildSynthesisPrompt(graph, userId);
  const profile = await generateJSON<Profile>(client, prompt);
  profile.userId = userId;
  profile.generatedAt = new Date().toISOString();
  return profile;
}
