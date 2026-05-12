@AGENTS.md

# Cinematica - Developer Guide

## Overview
Cinematica is a modern, responsive web application for discovering trending, popular, and top-rated movies and TV shows. It allows authenticated users to curate personalized watchlists. It utilizes the TMDb (The Movie Database) API for its media data.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database**: Neon PostgreSQL
- **ORM**: Prisma v6 (`@prisma/client`)
- **Animations**: framer-motion, embla-carousel-react

## Project Structure
- `app/`: Next.js App Router pages and layouts.
  - `page.tsx`: Homepage with auto-playing Hero carousel.
  - `movies/page.tsx` & `tv/page.tsx`: Popular and Top Rated lists.
  - `movie/[id]/page.tsx` & `tv/[id]/page.tsx`: Detailed media pages showing cast, trailers, and recommendations.
  - `watchlist/page.tsx`: Protected page displaying the user's saved items.
  - `actions/watchlist.ts`: Server actions for database operations.
  - `layout.tsx`: Root layout including the global `Navbar`, `<ClerkProvider>`, and forced dark mode.
- `components/`: React components.
  - `ui/`: shadcn/ui base components.
  - `media/`: Components specific to media pages (`MediaHero`, `CastRow`, `TrailerModal`, `WatchlistButton`).
  - `Navbar.tsx`: Global navigation with Clerk authentication modals.
- `lib/`: Utility functions.
  - `tmdb.ts`: Data fetching logic from TMDb API.
  - `prisma.ts`: PrismaClient singleton for database connections.
- `prisma/`: Database schema (`schema.prisma`).

## Build & Dev Commands
- **Install dependencies**: `npm install`
- **Database Schema Sync**: `npx prisma db push` (Pushes the schema to Neon. Ensure you use an internet connection that allows outbound port 5432).
- **Run Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Start Production Server**: `npm start`
- **Linting**: `npm run lint`

## Environment Variables
Create a `.env.local` and `.env` file in the root directory:
```env
TMDB_API_KEY=your_tmdb_api_key

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon PostgreSQL Connection String (Direct Connection, no -pooler in hostname)
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require&connect_timeout=30"
```

## Developer Notes
- **Next.js 16 `params`**: Page `params` and `searchParams` are Promises. You must always `await params` before destructuring. (e.g., `const { id } = await params;`).
- **Prisma & Next.js**: The development server loads `.env.local` into memory only at startup. If you change database credentials, you must restart `npm run dev`.
- **Cinematic Aesthetic**: Maintain deep dark mode (`#0a0a0a`), heavy use of glassmorphism (`backdrop-blur`), and Framer Motion micro-animations.
