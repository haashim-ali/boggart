import crypto from 'node:crypto';
import type { Profile, Strategy, GeneratedContent, VisualConcept, Copy, VideoScript } from '@boggart/shared';
import { createClient, generateJSON } from '../gemini/client';
import {
  buildStrategyPrompt,
  buildVisualPrompt,
  buildCopyPrompt,
  buildVideoPrompt,
} from '../gemini/prompts';
import { getGoogleAI } from '../google-ai/client';
import { generateImage } from '../google-ai/image';
import { startVideoGeneration } from '../google-ai/video';

/** The shape Claude returns — without the media status fields we add ourselves */
type VisualConceptSpec = Omit<VisualConcept, 'generatedImage'>;
type VideoScriptSpec = Omit<VideoScript, 'generatedVideo'>;

export async function generateContent(
  profile: Profile,
  goal: string,
): Promise<GeneratedContent> {
  const client = createClient();

  // Strategy first
  const strategyPrompt = buildStrategyPrompt(profile, goal);
  const strategy = await generateJSON<Strategy>(client, strategyPrompt);

  // Visual, copy, and video in parallel
  const [visualSpec, copy, videoSpec] = await Promise.all([
    generateJSON<VisualConceptSpec>(client, buildVisualPrompt(profile, strategy, goal)),
    generateJSON<Copy>(client, buildCopyPrompt(profile, strategy, goal)),
    generateJSON<VideoScriptSpec>(client, buildVideoPrompt(profile, strategy, goal)),
  ]);

  // Initialise media fields
  const visual: VisualConcept = { ...visualSpec, generatedImage: { status: 'unavailable' } };
  const videoScript: VideoScript = { ...videoSpec, generatedVideo: { status: 'unavailable' } };

  // Generate image synchronously if Google AI is available
  const ai = getGoogleAI();
  if (ai) {
    visual.generatedImage = await generateImage(ai, visual.imagePrompt);
  }

  const content: GeneratedContent = {
    id: crypto.randomUUID(),
    goal,
    strategy,
    visual,
    copy,
    videoScript,
    generatedAt: new Date().toISOString(),
  };

  // Fire-and-forget video generation (mutates content.videoScript.generatedVideo)
  if (ai) {
    startVideoGeneration(ai, content);
  }

  return content;
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
