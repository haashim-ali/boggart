import type {
  MeResponse,
  PipelineStatus,
  ProfileResponse,
  EntitiesResponse,
  GenerateResponse,
  BrandsResponse,
  MediaStatusResponse,
} from '@boggart/shared';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  auth: {
    me: () => apiFetch<MeResponse>('/api/auth/me'),
    login: () => { window.location.href = '/api/auth/login'; },
    logout: () => apiFetch<void>('/api/auth/logout'),
  },
  pipeline: {
    start: () => apiFetch<{ ok: boolean }>('/api/pipeline/start', { method: 'POST' }),
    status: () => apiFetch<PipelineStatus>('/api/pipeline/status'),
  },
  profile: {
    get: () => apiFetch<ProfileResponse>('/api/profile'),
    entities: () => apiFetch<EntitiesResponse>('/api/profile/entities'),
  },
  generate: {
    create: (goal: string) =>
      apiFetch<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ goal }),
      }),
    brands: () => apiFetch<BrandsResponse>('/api/generate/brands'),
  },
  media: {
    videoStatus: (contentId: string) =>
      apiFetch<MediaStatusResponse>(`/api/media/video/${contentId}/status`),
  },
};
