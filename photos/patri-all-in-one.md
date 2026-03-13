# PATRI — All-in-one Copilot Build Spec (Next.js + Dark Pixel + Isometric + Loot + Local AI)

You are GitHub Copilot in VS Code acting as a senior full-stack engineer. Generate a complete, runnable repository in the currently-open workspace folder (this repo lives at `M:\Repo\Patri` on Windows). Create/overwrite files as needed.

Hard requirements:
- Next.js App Router + TypeScript
- Tailwind CSS + strict pixel-art rendering rules
- Dark “gothic/cyber” pixel theme + CRT overlay
- Highly interactive: isometric room builder with draggable/snap furniture + animations
- AI Agent chat: works for users (navigator/designer) + admins (advisor), streams responses
- Local AI: Ollama via Vercel AI SDK (server route), configurable by env vars
- Gamification: token balance + loot box roll animations + confetti + rare drops
- Event-driven: every significant action dispatches `patri-action` events; admin dashboard listens and reacts

Output: create ALL files/folders, ensure `npm i` then `npm run dev` works.

---

## 0) Project decisions (choose defaults)
- Package manager: npm
- Node: LTS (use whatever Next.js supports)
- UI: Tailwind + custom CSS (no shadcn needed)
- State: React state + localStorage persistence (no DB yet)
- Auth: Not implemented (stub admin access via route `/admin` only)
- AI model: default `llama3.1` (override via env)

---

## 1) Deliverables: File/Folder structure

Create this structure:

- README.md
- package.json
- next.config.ts
- tsconfig.json
- postcss.config.mjs
- tailwind.config.ts
- .eslintrc.json
- .prettierrc
- .prettierignore
- .gitignore
- .env.example

- app/
  - layout.tsx
  - page.tsx
  - admin/
    - page.tsx
  - api/
    - chat/
      - route.ts

- components/
  - PixelButton.tsx
  - PixelCard.tsx
  - PixelInput.tsx
  - CrtOverlay.tsx
  - AiAgent.tsx
  - IsometricRoomGrid.tsx
  - LootBox.tsx
  - AdminEventFeed.tsx
  - Navbar.tsx

- lib/
  - cn.ts
  - events.ts
  - storage.ts
  - loot.ts
  - ollama.ts
  - constants.ts
  - analytics.ts

- public/
  - sprites/
    - README.md (placeholder instructions for adding sprites later)

- styles/
  - globals.css

---

## 2) package.json (dependencies & scripts)

Create a correct package.json for Next.js App Router + TS + Tailwind + ESLint + Prettier.

Dependencies MUST include:
- next, react, react-dom
- tailwindcss, postcss, autoprefixer
- framer-motion
- ai, ai-sdk-ollama  (for chat + ollama provider)
- lucide-react
- canvas-confetti
- zod (for request validation)

Dev dependencies MUST include:
- typescript, @types/node, @types/react, @types/react-dom
- eslint, eslint-config-next
- prettier

Scripts must include:
- dev, build, start, lint, format

---

## 3) Styling rules (pixel + dark + CRT)

### styles/globals.css
- Tailwind directives.
- Global pixel rule: `image-rendering: pixelated;` and avoid blur.
- Create CSS variables for theme:
  - Background layers: `--bg0`, `--bg1`
  - Accent: `--accent`, `--accent2`
  - Terminal colors: `--termGreen`, `--termAmber`
- Create reusable pixel-border utility classes:
  - `.px-border` chunky border via box-shadow (multi-step)
  - `.px-panel` dark panel background + border + inset shadow
- CRT overlay:
  - scanlines + subtle vignette + noise-like gradient
  - Must not block clicks (`pointer-events: none`)
- Reduced motion: respect `prefers-reduced-motion`

### components/CrtOverlay.tsx
- Renders overlay div with the CRT classes.
- Used in layout.

---

## 4) Layout & navigation

### app/layout.tsx
- Use `next/font/google` and pick either `VT323` OR `Press_Start_2P` (choose VT323 for readability).
- Render:
  - `<Navbar />`
  - `<CrtOverlay />` fixed
  - main content in a centered container

### components/Navbar.tsx
- Pixel-art nav bar with links:
  - Home `/`
  - Admin `/admin`
- Animated hover underline or pixel “shine”.

---

## 5) Core interactivity: Isometric Room Builder

### components/IsometricRoomGrid.tsx
Create a highly interactive isometric room builder:
- "use client"
- Render an isometric “floor” made of tiles:
  - Use a square grid (e.g., 10x10) but display in isometric projection.
  - Implement projection math:
    - Given tile coords (x,y), compute screen position:
      - screenX = (x - y) * tileW/2
      - screenY = (x + y) * tileH/2
  - Keep integer-ish coordinates where possible for pixel crispness.
- Provide a “palette” of furniture items (mock objects):
  - id, name, rarity, size (w,h in tiles), color, emoji/icon fallback
  - Examples: "Gothic Sofa", "Iron Chandelier", "Neon Arcade Cabinet", "Cursed Mirror"
- Draggable furniture:
  - Use Framer Motion drag.
  - On drag end, snap to nearest tile (grid snapping).
  - Prevent placing outside bounds; if outside, revert to last valid tile.
- Layering:
  - Use z-index based on tileY (screenY) so items in “front” appear above those behind.
- Dispatch events:
  - On successful place: dispatch `patri-action` with `{ type:'ITEM_PLACED', itemId, name, x, y }`
  - On remove: `{ type:'ITEM_REMOVED', ... }`
- Persistence:
  - Save layout to localStorage (key: `patri.layout.v1`).

### lib/analytics.ts + lib/events.ts
- Provide a tiny event bus:
  - `dispatchPatriEvent(detail)`
  - `onPatriEvent(handler)` returns unsubscribe
- Also store last 100 events in localStorage for admin feed (key: `patri.events.v1`).

---

## 6) Gamification: tokens + loot box

### components/LootBox.tsx
- "use client"
- Token balance:
  - Start with 500 tokens if none in storage.
  - Persist key: `patri.tokens.v1`
- Button: "Roll (100 tokens)"
- Roll flow:
  - If insufficient tokens, show terminal-style error.
  - Deduct 100, animate chest (shake + glow), then reveal item.
  - Weighted rarity:
    - common 70%
    - rare 25%
    - legendary 5%
- On rare/legendary win:
  - trigger `canvas-confetti` burst
  - show animated badge
- Dispatch event:
  - `{ type:'LOOT_ROLLED', rarity, itemName }`

### lib/loot.ts
- Implement loot tables and weighted random.

---

## 7) AI Agent: user guide + admin advisor + streaming

### components/AiAgent.tsx
- "use client"
- Floating bottom-right pixel avatar button that toggles open/closed.
- Chat UI:
  - Retro terminal panel with green/amber text.
  - Input field + send button (PixelButton).
  - Use `useChat` from `ai/react`.
  - Endpoint: `/api/chat`
  - Include `body: { role }` to send role to server.
- Role behavior:
  - role="user": friendly navigator and interior design assistant; can answer "where is X" and give design ideas.
  - role="admin": business advisor; also listens to event stream.
- Event-aware admin:
  - If role is admin, subscribe to patri-action events:
    - Append a small “Event:” line in the chat panel (not sent to model automatically), AND
    - Maintain an internal summary string (last 10 events) that IS sent to the model as a hidden system message when the admin sends a prompt (so the model has context).
- UX:
  - Add quick prompts (chips): “Suggest a dark living room”, “Optimize layout”, “What’s trending?”, etc.

### components/PixelInput.tsx
- Styled input with pixel border, focus glow.

---

## 8) API Route: Local Ollama via Vercel AI SDK

### lib/ollama.ts
- Read env:
  - OLLAMA_BASE_URL default `http://localhost:11434/api`
  - OLLAMA_MODEL default `llama3.1`
- Export helper to create model.

### app/api/chat/route.ts
- POST only.
- Validate body using zod:
  - messages: array of role/content
  - role: 'user'|'admin'
  - optional: eventSummary string
- Use Vercel AI SDK streaming:
  - create ollama client with baseURL
  - call streamText with:
    - model: ollama(OLLAMA_MODEL)
    - system prompt depends on role:
      - user system prompt: “You are The Architect, a helpful pixel-RPG interior design guide and site navigator. Short, atmospheric, actionable replies.”
      - admin system prompt: “You are Patri’s Business AI. Use event summaries to propose monetization, catalog changes, and UX improvements. Be direct and practical.”
    - messages: include incoming messages; if admin and eventSummary exists, prepend a system note with those events.
- Return `toDataStreamResponse()` so the UI streams.

### .env.example
Include:
- OLLAMA_BASE_URL=http://localhost:11434/api
- OLLAMA_MODEL=llama3.1

---

## 9) Pages

### app/page.tsx (User)
- Hero section: dark atmospheric, pixel heading.
- Render:
  - <IsometricRoomGrid />
  - <LootBox /> sidebar/panel
  - <AiAgent role="user" />
- Add tiny “How to play” panel explaining drag/snap/roll.

### app/admin/page.tsx (Admin)
- Pixel dashboard cards:
  - Tokens spent today (mock from events)
  - Most placed item (computed from stored events)
  - Loot rolls by rarity (computed)
- Include:
  - <AdminEventFeed /> shows last events live
  - <AiAgent role="admin" />

### components/AdminEventFeed.tsx
- Subscribes to patri-action events and shows them (timestamped).
- Also reads from localStorage on load.

---

## 10) Utility & quality

### lib/storage.ts
- Safe localStorage helpers with try/catch.

### lib/cn.ts
- className merge helper (simple implementation; no external dep required).

### Accessibility & performance
- Respect reduced motion.
- Avoid huge re-renders; memoize derived stats in admin page.
- Ensure pixel crispness: no fractional scaling for sprites (document best effort).

---

## 11) README.md (must be clear)
Include:
- Prereqs: Node, npm, Ollama
- Setup:
  - npm i
  - copy .env.example to .env.local
  - run ollama (example: `ollama run llama3.1`)
  - npm run dev
- Explain user vs admin modes.

---

## 12) Acceptance checks (must pass)
- `npm run dev` runs with no TypeScript errors.
- Home page:
  - can drag/snap furniture; placements persist after refresh.
  - loot roll works; confetti on rare+.
  - AI chat opens and sends requests (streaming).
- Admin page:
  - event feed updates when actions happen on home page in same browser.
  - AI agent can reference recent events via eventSummary.

Now implement everything with full code for each file. Do not leave TODOs except in public/sprites/README.md.
