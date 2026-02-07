# Boggart

Hyper-personalised content generator. Ingests your digital footprint via Google services, builds a psychological profile with Claude, then generates tailored advertising content — copy, images, and video.

## How it works

1. **Ingest** — Pulls data from Gmail, Calendar, Contacts, YouTube and Google Drive via OAuth2
2. **Condense** — Haiku summarises raw data into structured entities (people, moments, artefacts)
3. **Synthesise** — Opus builds a psychological profile: identity, Big Five traits, values, relationships
4. **Generate** — Produces ad strategy, visual concepts, copy and video scripts for any brand or goal
5. **Render** — Nano Banana Pro generates images; Veo 3.1 generates video

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 6 |
| Backend | Express 4, TypeScript 5.7 |
| AI — profiling | Claude Opus 4.6 (synthesis), Haiku (condensing) |
| AI — media | Nano Banana Pro (images), Veo 3.1 (video) |
| Auth | Google OAuth2 with offline tokens |
| Storage | In-memory (MVP) |
| Monorepo | npm workspaces |

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Source |
|----------|--------|
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) — OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `GOOGLE_AI_API_KEY` | [ai.google.dev](https://ai.google.dev) — for image/video generation |
| `SESSION_SECRET` | Any random string |

Google OAuth redirect URI: `http://localhost:3000/api/auth/callback/google`

Required scopes: Gmail (read), Calendar (read), Contacts (read), YouTube (read), Drive (read), userinfo.

## Development

```bash
npm run dev          # Server (:3000) + web (:5173) concurrently
npm run dev:server   # Server only
npm run dev:web      # Web only
npm run typecheck    # All packages
```

## Production

```bash
npm run build
npm run start
```

## Project structure

```
packages/
  shared/     # Types — entities, profile, content, API contracts
  server/     # Express API
    services/
      google/       # OAuth + data ingestion (Gmail, Calendar, etc.)
      pipeline/     # Orchestrator, entity linker, condenser, synthesiser
      gemini/       # Claude client + prompts
      google-ai/    # Nano Banana Pro + Veo 3.1
  web/        # React SPA
    pages/          # Login, Ingest, Profile, Generate
    components/     # Shader background, pipeline status, content cards
    hooks/          # useAuth, usePipeline, useProfile, useGenerate
```

## API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | GET | Redirect to Google OAuth |
| `/api/auth/me` | GET | Current user |
| `/api/auth/logout` | GET | Clear session |
| `/api/pipeline/start` | POST | Trigger data ingestion |
| `/api/pipeline/status` | GET | Poll pipeline progress |
| `/api/profile` | GET | Synthesised profile |
| `/api/profile/entities` | GET | Raw entity graph |
| `/api/generate` | POST | Generate content for custom goal |
| `/api/generate/brands` | GET | Generate sample brand ads |
| `/api/media/video/:id/status` | GET | Poll video generation |
