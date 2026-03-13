# PATRI

Dark pixel-art isometric room builder with loot gamification and local AI chat via Ollama.

## Prerequisites

- Node.js LTS
- npm
- Ollama installed and running locally

## Setup

1. Install dependencies:
   - `npm i`
2. Create env file:
   - Copy `.env.example` to `.env.local`
3. Start an Ollama model (example):
   - `ollama run llama3.1`
4. Run the app:
   - `npm run dev`

App runs at `http://localhost:3000`.

## Validation Commands

- `npm run lint`
- `npm run test`
- `npm run build`

## Docker Desktop: Clean Fresh Deployment

This repository's Docker Compose stack currently manages Redis only.

1. Pre-check Docker Desktop
   - `docker --version`
   - `docker compose version`
   - `docker compose ls`

2. Ensure PATRI env values exist (`.env.local` or shell env)
   - `PATRI_REDIS_PORT=6380` (default is `6380` to avoid conflict with other stacks on `6379`)

3. Clean old PATRI resources
   - `docker compose down --volumes --remove-orphans`

4. Pull latest image and start clean
   - `docker compose pull`
   - `docker compose up -d`

5. Verify health
   - `docker compose ps`
   - `docker compose logs redis --tail=50`

6. Optional global cleanup (safe-ish, not PATRI-specific)
   - `docker image prune -f`
   - `docker builder prune -f`

Important:
- If another stack already uses host port `6379`, PATRI uses `6380` by default.
- PATRI app itself is run with `npm run dev` unless/until an app Docker service is added.

## Modes

- User mode: `/`
  - Build a room with draggable isometric furniture.
  - Roll loot with token economy.
  - Chat with The Architect for navigation + design help.

- Admin mode: `/admin`
  - Live event feed from in-app actions.
  - Dashboard metrics computed from stored events.
  - Advisor AI receives event summary context for practical recommendations.

## Environment

Use `.env.local`:

- `OLLAMA_BASE_URL` defaults to `http://localhost:11434/api`
- `OLLAMA_MODEL` defaults to `llama3.1`

Example `.env.local`:

```env
OLLAMA_BASE_URL=http://localhost:11434/api
OLLAMA_MODEL=llama3.1
```

## Notes

- State is local-first via `localStorage`.
- Significant interactions dispatch `patri-action` events and are persisted for admin analytics.

## Acceptance Checklist

- Home page (`/`):
   - Add furniture from palette and drag to snap to tile.
   - Placement blocks out-of-bounds and overlapping drops.
   - Refresh persists room layout.
   - Loot roll spends 100 tokens and triggers confetti on rare/legendary.
   - Chat panel opens and streams local Ollama responses.
- Admin page (`/admin`):
   - Event feed updates from user activity.
   - Tokens spent, most placed item, and rarity stats update from event history.
   - Admin AI can use recent event summary context.

## Release Checklist

1. Environment
   - Confirm `.env.local` exists with `OLLAMA_BASE_URL` and `OLLAMA_MODEL`.
   - Confirm Ollama is running and model is available (`ollama run llama3.1`).

2. Quality Gates
   - Run `npm run lint` and verify no warnings/errors.
   - Run `npm run test` and verify all tests pass.
   - Run `npm run build` and verify production build succeeds.

3. Manual Smoke Test
   - Open `/` and place furniture from palette.
   - Drag item and confirm tile snap + blocked invalid placement.
   - Refresh and confirm layout persistence.
   - Roll loot until rare/legendary and confirm confetti + event recording.
   - Open user AI and confirm responses stream.
   - Open `/admin` and confirm feed/stats reflect activity.
   - Open admin AI and confirm event-aware suggestions.
