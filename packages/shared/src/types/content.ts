/** Status of a generated media asset (image or video) */
export type MediaStatus =
  | { readonly status: 'unavailable' }
  | { readonly status: 'generating' }
  | { readonly status: 'completed'; readonly url: string }
  | { readonly status: 'failed'; readonly error: string };

/** Persuasion strategy tailored to a specific profile and goal */
export interface Strategy {
  targetSummary: string;
  goal: string;
  persuasionApproach: string;
  emotionalHooks: string[];
  personalReferences: string[];
  tone: string;
  callToAction: string;
}

/** Visual concept for an ad or content piece */
export interface VisualConcept {
  description: string;
  style: string;
  colorPalette: string[];
  personalElements: string[];
  imagePrompt: string;
  generatedImage: MediaStatus;
}

/** Ad copy with personalized hooks */
export interface Copy {
  headline: string;
  body: string; // < 50 words
  personalHooks: string[];
}

/** A single shot in a video script */
export interface Shot {
  description: string;
  duration: string;
  movement: string;
  overlayText?: string;
}

/** Short video script (6-10 seconds) */
export interface VideoScript {
  duration: string;
  shots: Shot[];
  mood: string;
  music: string;
  narration?: string;
  generatedVideo: MediaStatus;
}

/** Complete generated content bundle for a goal */
export interface GeneratedContent {
  id: string;
  goal: string;
  strategy: Strategy;
  visual: VisualConcept;
  copy: Copy;
  videoScript: VideoScript;
  generatedAt: string; // ISO 8601
}
