import crypto from 'node:crypto';
import type { Profile, Strategy, GeneratedContent, VisualConcept, Copy, VideoScript } from '@boggart/shared';
import { createClient, generateJSON } from '../gemini/client';
import {
  buildStrategyPrompt,
  buildVisualPrompt,
  buildCopyPrompt,
  buildVideoPrompt,
} from '../gemini/prompts';

export async function generateContent(
  profile: Profile,
  goal: string,
): Promise<GeneratedContent> {
  const client = createClient();

  // Strategy first
  const strategyPrompt = buildStrategyPrompt(profile, goal);
  const strategy = await generateJSON<Strategy>(client, strategyPrompt);

  // Visual, copy, and video in parallel
  const [visual, copy, videoScript] = await Promise.all([
    generateJSON<VisualConcept>(client, buildVisualPrompt(profile, strategy, goal)),
    generateJSON<Copy>(client, buildCopyPrompt(profile, strategy, goal)),
    generateJSON<VideoScript>(client, buildVideoPrompt(profile, strategy, goal)),
  ]);

  return {
    id: crypto.randomUUID(),
    goal,
    strategy,
    visual,
    copy,
    videoScript,
    generatedAt: new Date().toISOString(),
  };
}

export async function generateBrandAds(profile: Profile): Promise<GeneratedContent[]> {
  const brands = [
    'Sell McDonald\'s Big Mac to this person',
    'Sell Coca-Cola to this person',
    'Sell Nike running shoes to this person',
  ];

  const results = await Promise.all(
    brands.map((goal) => generateContent(profile, goal)),
  );

  return results;
}
