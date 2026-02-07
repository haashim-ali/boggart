import path from 'node:path';
import os from 'node:os';
import { mkdir } from 'node:fs/promises';
import type { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import type { GeneratedContent, MediaStatus } from '@boggart/shared';

const POLL_INTERVAL_MS = 10_000;
const MAX_POLL_ATTEMPTS = 30; // 5 minutes

/** Map of contentId → path to downloaded video file */
const videoFiles = new Map<string, string>();

/** Get the local file path for a generated video, if available */
export function getVideoFilePath(contentId: string): string | undefined {
  return videoFiles.get(contentId);
}

/** Build a Veo 3.1 prompt from generated content */
function buildVeoPrompt(content: GeneratedContent): string {
  const { visual, copy, videoScript } = content;
  const shotDescriptions = videoScript.shots
    .map((s, i) => `Shot ${i + 1} (${s.duration}): ${s.description} — ${s.movement}`)
    .join('. ');

  return [
    `Create a ${videoScript.duration} advertisement video.`,
    `Visual style: ${visual.style}. ${visual.description}`,
    `Headline: "${copy.headline}"`,
    `Mood: ${videoScript.mood}. Music feel: ${videoScript.music}.`,
    `Shots: ${shotDescriptions}`,
    videoScript.narration ? `Narration: "${videoScript.narration}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fire-and-forget video generation. Mutates content.videoScript.generatedVideo
 * through the lifecycle: generating → completed / failed.
 */
export function startVideoGeneration(
  ai: GoogleGenAI,
  content: GeneratedContent,
): void {
  const script = content.videoScript as { generatedVideo: MediaStatus };
  script.generatedVideo = { status: 'generating' };

  runVideoGeneration(ai, content).catch((err) => {
    const message = err instanceof Error ? err.message : 'Video generation failed';
    console.error('[google-ai/video] generation failed:', message);
    script.generatedVideo = { status: 'failed', error: message };
  });
}

async function runVideoGeneration(
  ai: GoogleGenAI,
  content: GeneratedContent,
): Promise<void> {
  const script = content.videoScript as { generatedVideo: MediaStatus };
  const prompt = buildVeoPrompt(content);

  let op: GenerateVideosOperation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt,
    config: {
      aspectRatio: '16:9',
      durationSeconds: 8,
    },
  });

  let attempts = 0;
  while (!op.done && attempts < MAX_POLL_ATTEMPTS) {
    await sleep(POLL_INTERVAL_MS);
    op = await ai.operations.getVideosOperation({ operation: op });
    attempts++;
  }

  if (!op.done) {
    script.generatedVideo = { status: 'failed', error: 'Video generation timed out' };
    return;
  }

  if (op.error) {
    const errorMsg =
      typeof op.error.message === 'string'
        ? op.error.message
        : 'Video generation returned an error';
    script.generatedVideo = { status: 'failed', error: errorMsg };
    return;
  }

  const generatedVideo = op.response?.generatedVideos?.[0];
  if (!generatedVideo) {
    script.generatedVideo = { status: 'failed', error: 'No video in response' };
    return;
  }

  // Download to temp file
  try {
    const tmpDir = path.join(os.tmpdir(), 'boggart-videos');
    await mkdir(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, `${content.id}.mp4`);

    await ai.files.download({
      file: generatedVideo,
      downloadPath: filePath,
    });

    videoFiles.set(content.id, filePath);
    script.generatedVideo = {
      status: 'completed',
      url: `/api/media/video/${content.id}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Video download failed';
    console.error('[google-ai/video] download failed:', message);
    script.generatedVideo = { status: 'failed', error: message };
  }
}
