# Cinematica - Agent & Developer Guidelines

## Overview

Cinematica is a modern, responsive web application for discovering trending, popular, and top-rated movies and TV shows. It allows authenticated users to curate personalized watchlists, track watched history, log ratings/reviews, and construct custom media folders/lists. It utilizes the TMDb (The Movie Database) API for media data.

## Tech Stack & Libraries

- **Framework**: Next.js 16.2 (App Router, Server & Client Components)
- **UI Library**: React 19 (Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables for theming, `tw-animate-css`
- **UI Primitives & Icons**: `@base-ui/react` (v1.4), `shadcn` (v4.7), `lucide-react` (v1.14), `react-icons` (v5.6)
- **Authentication**: Clerk (`@clerk/nextjs` v7)
- **Database**: Neon PostgreSQL
- **ORM**: Prisma v6 (`@prisma/client`)
- **Animations & Carousels**: `framer-motion` (v12), `embla-carousel-react` (v8), `embla-carousel-autoplay` (v8)

## Project Structure

- `app/`: Next.js App Router pages, layouts, and server actions.
  - `page.tsx`: Homepage with auto-playing Hero carousel.
  - `movies/page.tsx` & `tv/page.tsx`: Discover page with advanced filtering (genres, rating, year, sorting) and infinite scroll.
  - `movie/[id]/page.tsx` & `tv/[id]/page.tsx`: Detailed media pages showing cast list, trailer modal, similar recommendations, and interactive features.
  - `watchlist/page.tsx`: Protected page displaying user's saved watchlist.
  - `watched/page.tsx`: Protected page displaying watched history feed and analytics stats (charts, runtime, rating breakdowns).
  - `lists/page.tsx`: Protected page showing user's custom lists and list creation form.
  - `lists/[id]/page.tsx`: Page displaying specific custom list items and list options.
  - `person/[id]/page.tsx`: Editorial person profile with signature-backdrop hero, Career DNA analytics, personal progress tracker, and interactive filmography.
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
    - `MediaHero.tsx`: Unified above-the-fold editorial stage with poster, logo/title, crew credits, clickable genres, and complete action bar.
    - `MediaWatchContext.tsx` & `PersonalWatchLog.tsx`: Synchronized detail-page watch tracking and personal watch history log cards.
    - `MediaDetailsGrid.tsx`: Region-aware "Where to Watch" streaming options and structured Film/Series production facts.
    - `SeasonEpisodeBrowser.tsx`: Interactive TV season selector and episode guide with stills, runtimes, and ratings.
    - `MediaGallery.tsx` & `MediaReviews.tsx`: Videos & theatrical stills lightbox gallery and expandable audience reviews.
    - `MediaDetailSkeleton.tsx`: Streaming loading skeleton shared by movie and TV detail routes.
    - `WatchedButton.tsx` & `LogWatchedModal.tsx`: Dialogs/controls to log media to watched history with ratings and review notes.
    - `WatchlistButton.tsx` & `MiniWatchlistButton.tsx`: Add/remove items from the watchlist.
    - `AddToCustomListButton.tsx` & `AddToCustomListModal.tsx`: Add media items to custom folders.
    - `CreateListButton.tsx` & `CreateListModal.tsx`: Create new custom lists.
    - `CustomListDetails.tsx`: Layout and items list for custom list views.
    - `HistoryFeed.tsx`: Render user watch history cards and stats charts.
    - `SearchModal.tsx`: Interactive cmd-palette style global search.
    - `TrailerModal.tsx`: Play YouTube trailers.
    - `CastRow.tsx`: Cast profiles carousel row.
  - `Navbar.tsx`: Floating frosted-glass capsule global navigation header with Clerk triggers, country switcher, library dropdown, and search activation.
  - `Footer.tsx`: Minimal monochrome global footer.
  - `Hero.tsx`: `85svh` crossfade home showcase with Trio CTAs, quiet streaming icons, and animated slide progress dock.
  - `GenrePillBar.tsx`: Quick category & genre deep-link filter bar below the Hero.
  - `MediaCard.tsx`: Unobstructed `2:3` poster card with caption underneath.
  - `MediaRail.tsx`, `TopTenRail.tsx`, `BackdropRail.tsx`, `WatchlistRail.tsx`, & `MediaRow.tsx`: Editorial 6-up portrait rails, numbered Top 10 showcase, `16:9` widescreen spotlight rails, personalized watchlist strip, and grid rows.
  - `explore/`: Explore catalog components for `/movies` and `/tv`:
    - `ExploreSpotlight.tsx`: Compact `48svh` atmospheric spotlight with official logos, trailer modal, and watchlist action.
    - `ExploreCommandBar.tsx`: Sticky frosted-glass category tabs, sort selector, view mode switcher, quick-genre strip, and removable active filter chips.
    - `ExploreFilterDrawer.tsx`: Slide-over glass filter studio with region-aware streaming services, genre AND/OR mode, era/year range, rating/vote count, runtime, language, movie certifications, TV status/networks, and personal library toggles.
    - `ExploreEditorialCard.tsx`: Detailed editorial card view with synopsis, genres, and watched state.
    - `ExploreCatalog.tsx` & `ExploreSkeleton.tsx`: URL-synced catalog orchestrator with infinite scroll and instant loading skeleton.
  - `person/`: Person profile & search talent components:
    - `PersonHero.tsx`: Full-bleed signature-backdrop stage with portrait, crafts, vital metadata, monochrome socials, and expandable biography.
    - `PersonKnownFor.tsx`: 6-up Embla carousel showcasing standout cast & crew works with role captions.
    - `PersonBentoGrid.tsx` & `PersonInteractiveBody.tsx`: Personal completion tracker, interactive Career DNA (genres & decade breakdown), and Personal Dossier.
    - `PersonFilmography.tsx`: Decade-grouped timeline and 6-up poster grid explorer with department tabs, search, sort, and Self/Talk Show filtering.
    - `PersonPhotos.tsx`, `PersonDetailSkeleton.tsx`, & `PersonCard.tsx`: Portrait lightbox carousel, route loading skeleton, and search talent card.
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

## Key Conventions & Developer Notes

1. **Next.js 16 App Router Conventions**:
   - Page dynamic `params` and `searchParams` are Promises. **Always** await them before destructuring (e.g., `const { id } = await params;` or `const { query } = await searchParams;`).
   - Use Next.js Server Actions under `app/actions/` (e.g., `watchlist.ts`, `watched.ts`, `lists.ts`, `media.ts`) for data mutating operations.
2. **Database Schema & Models**:
   - Check `prisma/schema.prisma` before editing DB interactions.
   - Three main features tracked in DB:
     - **Watchlist**: `WatchlistItem` model.
     - **Watched History & Stats**: `WatchedItem` model (stores rating, runtime, custom notes, watched date).
     - **Custom User Lists**: `CustomList` & `CustomListItem` models (creates custom folders/groups of media).
   - **Prisma & Next.js**: The development server loads `.env.local` into memory only at startup. If you change database credentials, you must restart `npm run dev`.
3. **Aesthetics & UI**:
   - Cinematica is designed with a premium, cinematic feel.
   - Dark theme is forced (`#0a0a0a` background).
   - Heavy use of glassmorphism (`backdrop-blur`), smooth micro-animations with Framer Motion, and responsive layouts are critical. Do not write bare HTML elements without matching the sleek styling.

<!-- BEGIN:nextjs-agent-rules -->
## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
