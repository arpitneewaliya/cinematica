<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Cinematica - Agent Guidelines

Welcome to Cinematica! Before working on this repository, please review the developer guide in [CLAUDE.md](file:///d:/MY_DEV_PROJECTS/cinematica/CLAUDE.md).

## Key Instructions for Agents

1. **Tech Stack & Libraries**:
   - Next.js 16 (App Router)
   - React 19 (Server & Client Components)
   - Tailwind CSS v4 for styling
   - `@clerk/nextjs` (v7) for Auth
   - Neon PostgreSQL + Prisma (v6) ORM
   - animations: `framer-motion` (v12), `embla-carousel-react` (v8) + `embla-carousel-autoplay` (v8)
   - UI primitives: `@base-ui/react` (v1.4) & `lucide-react` (v1.14) & `react-icons` (v5.6)
   - CLI/UI utility: `shadcn` (v4.7)

2. **Next.js 16 App Router Conventions**:
   - Page dynamic params and searchParams are Promises. **Always** await them before destructuring (e.g., `const { id } = await params;` or `const { query } = await searchParams;`).
   - Use Next.js Server Actions under `app/actions/` (e.g., `watchlist.ts`, `watched.ts`, `lists.ts`, `media.ts`) for data mutating operations.

3. **Database Schema & Models**:
   - Check `prisma/schema.prisma` before editing DB interactions.
   - Three main features tracked in DB:
     - Watchlist: `WatchlistItem` model.
     - Watched History & Stats: `WatchedItem` model (stores rating, runtime, custom notes, watched date).
     - Custom User Lists: `CustomList` & `CustomListItem` models (creates custom folders/groups of media).

4. **Aesthetics & UI**:
   - Cinematica is designed with a premium, cinematic feel.
   - Dark theme is forced (`#0a0a0a` background).
   - Glassmorphism, smooth animations with Framer Motion, and responsive layouts are critical. Do not write bare HTML elements without matching the sleek styling.
