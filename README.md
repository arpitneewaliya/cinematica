# Cinematica

A modern, responsive, premium web application for discovering movies and TV shows and curating your personal viewing experience. Powered by the TMDb API, Clerk Authentication, and Neon PostgreSQL.

## Features

- 🎬 **Premium Cinematic UI** — forced dark theme (`#0a0a0a`) with high-fidelity glassmorphism, responsive mobile layout, and smooth animations.
- 🎠 **Auto-playing Hero Carousel** — immersive, auto-playing home slider displaying trending films and television series with custom control.
- 🔍 **Global Command Palette Search** — a CMD+K style interactive command dialog with real-time autocomplete results.
- 🗂️ **Advanced Discover & Filter** — dedicated pages for movies and TV shows with tabbed lists (Popular / Top Rated) and multi-criteria filters (genres, minimum ratings, release year, sorting).
- 🏷️ **Watchlist Management** — save and manage media you want to watch.
- 📊 **Watched History & Analytics** — log watched titles with custom watch dates, star ratings (1-5), and review notes. Access a detailed dashboard featuring stats on total watch time, average rating, rating distribution charts, and monthly activity.
- 📁 **Custom Playlists/Lists** — organize media into custom lists (e.g., "Must-Watch Sci-Fi", "Date Night") with custom descriptions.
- 🔐 **Secure Clerk Authentication** — seamless authentication flow (sign-in/sign-up modals) integrated with PostgreSQL user state syncing.

## Tech Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Framework** | Next.js 16.2 (App Router) | React Server & Client Components, Server Actions |
| **Language** | TypeScript | Strong typing across components, APIs, and actions |
| **Styling** | Tailwind CSS v4 | CSS variables, modern utility-first layout |
| **UI Primitives** | Base UI (`@base-ui/react`) + shadcn | Accessible UI primitives and components |
| **Icons** | Lucide React + React Icons | Harmonious, high-quality svg icons |
| **Auth** | Clerk (`@clerk/nextjs` v7) | Modern secure user sessions and components |
| **Database** | Neon PostgreSQL | Serverless SQL database |
| **ORM** | Prisma v6 | Type-safe schema definitions and client query building |
| **Animations** | Framer Motion (v12) | Micro-interactions and transition animations |
| **Carousel** | Embla Carousel (v8) | Auto-playing carousel slideshow hooks |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A [TMDb API key](https://www.themoviedb.org/settings/api)
- A [Clerk](https://clerk.com) account (Publishable Key + Secret Key)
- A Neon/PostgreSQL database instance

### Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` and `.env` file in the root of the project:
   ```env
   TMDB_API_KEY=your_tmdb_api_key

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Database Connection String
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require&connect_timeout=30"
   ```

3. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```
app/
├── actions/             # Next.js Server Actions
│   ├── lists.ts         # Create/delete custom lists, manage items
│   ├── media.ts         # Client-side TMDb pagination loaders
│   ├── watched.ts       # Watched log triggers, rating & review handlers, stats calculator
│   └── watchlist.ts     # Watchlist add/remove handlers
├── lists/               # Custom lists folder pages
│   ├── page.tsx         # User custom lists landing
│   └── [id]/            # Detailed custom list items view
├── movie/[id]/          # Movie details page (cast, trailer, watchlist/log buttons)
├── tv/[id]/             # TV show details page (cast, trailer, watchlist/log buttons)
├── movies/              # Discover movies layout (filters, infinite scroll)
├── tv/                  # Discover TV shows layout (filters, infinite scroll)
├── watched/             # Watched history feed and interactive stats panel
├── watchlist/           # User saved items grid
├── search/              # Grid of search query results
├── layout.tsx           # Global provider setups and layout
└── globals.css          # Tailwind CSS v4 styling rules
components/
├── media/               # High-level media modules
│   ├── MediaHero.tsx    # Header backdrop with action controls
│   ├── CastRow.tsx      # Horizontal cast profiles
│   ├── WatchedButton.tsx / LogWatchedModal.tsx  # Logs watched history & reviews
│   ├── WatchlistButton.tsx / MiniWatchlistButton.tsx  # Watchlist togglers
│   ├── AddToCustomListButton.tsx / AddToCustomListModal.tsx # List management dialogs
│   ├── CreateListButton.tsx / CreateListModal.tsx  # Playlists creator
│   ├── HistoryFeed.tsx  # Watch stats charts and history grid
│   ├── SearchModal.tsx  # Cmd-palette search modal
│   └── TrailerModal.tsx # YouTube player dialog
├── Navbar.tsx           # Site header with Clerk buttons and search bar
├── SearchBar.tsx        # Triggers SearchModal
├── Hero.tsx             # Interactive landing carousel
├── MediaCard.tsx        # Media card with ratings
├── MediaRow.tsx         # Media scroll section
└── MediaListTabs.tsx    # Filterable categories tab row
lib/
├── prisma.ts            # Prisma client singleton
└── tmdb.ts              # TMDb query helpers and fetch calls
prisma/
└── schema.prisma        # Database schema models (WatchlistItem, WatchedItem, CustomList, CustomListItem)
```

## Developer Guidelines

For project conventions (Promise-based search params in Next 16, Neon connection parameters, and coding styles), please consult [AGENTS.md](file:///d:/MY_DEV_PROJECTS/cinematica/AGENTS.md) and [CLAUDE.md](file:///d:/MY_DEV_PROJECTS/cinematica/CLAUDE.md).

## License

MIT
