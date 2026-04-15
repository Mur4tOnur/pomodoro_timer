# FOCUS

Minimal **Pomodoro / focus timer** web app: **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS v4**. Dark glass-style UI with a focus ring, session settings (focus, break, rest, alarm), draggable panels on tablet/desktop, and optional ambient soundscapes. No database or auth—ready to host as a static-friendly Next deployment.

**Repository:** [github.com/Mur4tOnur/pomodoro_timer](https://github.com/Mur4tOnur/pomodoro_timer)

## Live deployment (Vercel)

This repo is configured for **[Vercel](https://vercel.com)** with zero extra env vars.

1. Push this repository to GitHub (see below if the remote is empty).
2. In Vercel: **Add New → Project** → import `Mur4tOnur/pomodoro_timer`.
3. Keep defaults:
   - **Framework Preset:** Next.js  
   - **Build Command:** `npm run build`  
   - **Output:** managed by Next (`.next`)  
   - **Install Command:** `npm install`
4. Click **Deploy**. Your site will be online at a `*.vercel.app` URL; you can attach a custom domain in Project Settings.

No `DATABASE_URL`, API keys, or `.env` are required for the current feature set.

## Features

- Reliable timer (end-timestamp based; safe pause/resume and background tabs).
- Default **25:00** focus; **MM:SS** display; session counter and total focus time.
- **Start / Pause**, **Reset**, ambient menu from the gear control.
- Completion **chime** (Web Audio); alarm style selectable in Session panel.
- **Ambient** beds (synthesized in-browser): silence, fireplace, rain, seaside, tavern, forest birds + volume.
- **Session** panel: focus / break / long rest / alarm via pickers (portaled menus).
- **Responsive:** stacked fixed panels on small phones; draggable floating panels from **768px** width up.

## Prerequisites

- **Node.js 20+** (recommended for Next.js 16)

## Local development

```bash
git clone https://github.com/Mur4tOnur/pomodoro_timer.git
cd pomodoro_timer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Development server (Turbopack)      |
| `npm run build` | Production build                    |
| `npm run start` | Production server (after `build`)   |
| `npm run lint`  | ESLint                              |

## Project structure (high level)

- `src/app/page.tsx` — main experience (background, panels, layout breakpoints).
- `src/app/layout.tsx` — fonts, metadata, root shell.
- `src/components/*` — timer, settings, ambient & option menus, draggable shell.
- `src/hooks/usePomodoroTimer.ts` — timer + total focus tracking.
- `src/lib/ambientEngine.ts` / `ambientPresets.ts` / `playChime.ts` — audio helpers.

## Customizing backgrounds

Swap or extend gradients (or add images/video) in `src/app/page.tsx` when you have assets; keep contrast so glass panels stay readable.

## License

Provided as-is for personal focus workflows.
