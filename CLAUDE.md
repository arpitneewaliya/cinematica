@AGENTS.md

# Cinematica - Developer Guide

## Overview
Cinematica is a modern, responsive web application for discovering trending, popular, and top-rated movies and TV shows. It allows authenticated users to curate personalized watchlists, track watched history, log ratings/reviews, and construct custom media folders/lists. It utilizes the TMDb (The Movie Database) API for media data.

## Tech Stack
- **Framework**: Next.js 16.2 (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables for theming, `tw-animate-css`
- **UI Components**: `@base-ui/react` (Base UI primitives), `shadcn` v4, `lucide-react`, `react-icons`
- **Authentication**: Clerk (`@clerk/nextjs` v7)
- **Database**: Neon PostgreSQL
- **ORM**: Prisma v6 (`@prisma/client`)
- **Animations**: `framer-motion` v12, `embla-carousel-react` v8, `embla-carousel-autoplay`

## Project Structure
- `app/`: Next.js App Router pages, layouts, and server actions.
  - `page.tsx`: Homepage with auto-playing Hero carousel.
  - `movies/page.tsx` & `tv/page.tsx`: Discover page with advanced filtering (genres, rating, year, sorting) and infinite scroll.
  - `movie/[id]/page.tsx` & `tv/[id]/page.tsx`: Detailed media pages showing cast list, trailer modal, similar recommendations, and interactive features.
  - `watchlist/page.tsx`: Protected page displaying user's saved watchlist.
  - `watched/page.tsx`: Protected page displaying watched history feed and analytics stats (charts, runtime, rating breakdowns).
  - `lists/page.tsx`: Protected page showing user's custom lists and list creation form.
  - `lists/[id]/page.tsx`: Page displaying specific custom list items and list options.
  - `search/page.tsx`: Full search result list page.
  - `actions/`: Next.js Server Actions for database mutations:
    - `watchlist.ts`: Manage watchlists.
    - `watched.ts`: Log items as watched with notes/ratings and generate stats.
    - `lists.ts`: Create, update, delete custom lists and manage list items.
    - `media.ts`: TMDb client-side loading actions.
  - `layout.tsx`: Root layout including global navigation, provider setup, and forced dark mode styling.
- `components/`: Reusable React components.
  - `ui/`: Base primitives and design wrappers.
  - `media/`: Components specific to movie/TV show pages, history feeds, search dialog, and list creation/log dialogues:
    - `MediaHero.tsx`: Immersive banner with trailer triggers and interactive logs.
    - `WatchedButton.tsx` & `LogWatchedModal.tsx`: Dialogs/controls to log media to watched history with ratings and review notes.
    - `WatchlistButton.tsx` & `MiniWatchlistButton.tsx`: Add/remove items from the watchlist.
    - `AddToCustomListButton.tsx` & `AddToCustomListModal.tsx`: Add media items to custom folders.
    - `CreateListButton.tsx` & `CreateListModal.tsx`: Create new custom lists.
    - `CustomListDetails.tsx`: Layout and items list for custom list views.
    - `HistoryFeed.tsx`: Render user watch history cards and stats charts.
    - `SearchModal.tsx`: Interactive cmd-palette style global search.
    - `TrailerModal.tsx`: Play YouTube trailers.
    - `CastRow.tsx`: Cast profiles row.
  - `Navbar.tsx`: Global navigation header containing profile button, Clerk triggers, links, and search activation.
  - `SearchBar.tsx`: Visual search input activating the SearchModal.
  - `Hero.tsx`: Home carousel layout.
  - `MediaCard.tsx` & `MediaRow.tsx`: Grid cards and scrolling rows.
  - `MediaListTabs.tsx`: Tabbed filters for movies & TV shows.
- `lib/`: Utility configuration code.
  - `tmdb.ts`: Data fetching functions from TMDb API.
  - `prisma.ts`: PrismaClient singleton pattern.
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
