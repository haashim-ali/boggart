import type { Profile } from './profile';
import type { EntityGraph } from './entities';
import type { GeneratedContent } from './content';

// ── Pipeline ──────────────────────────────────────────────

export type PipelineWorkerName = 'gmail' | 'calendar' | 'contacts' | 'youtube' | 'drive';

export type PipelineWorkerStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface PipelineWorkerState {
  name: PipelineWorkerName;
  status: PipelineWorkerStatus;
  itemCount?: number;
  error?: string;
}

export type PipelineStage =
  | 'idle'
  | 'ingesting'
  | 'linking'
  | 'condensing'
  | 'synthesizing'
  | 'complete'
  | 'error';

export interface PipelineStatus {
  stage: PipelineStage;
  workers: PipelineWorkerState[];
  error?: string;
}

// ── Auth ──────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface MeResponse {
  user: AuthUser | null;
}

// ── Profile ───────────────────────────────────────────────

export interface ProfileResponse {
  profile: Profile | null;
}

export interface EntitiesResponse {
  entities: EntityGraph | null;
}

// ── Content Generation ────────────────────────────────────

export interface GenerateRequest {
  goal: string;
}

export interface GenerateResponse {
  content: GeneratedContent;
}

export interface BrandsResponse {
  brands: GeneratedContent[];
}

// ── Media ────────────────────────────────────────────────

export interface MediaStatusResponse {
  contentId: string;
  video: import('./content').MediaStatus;
}
