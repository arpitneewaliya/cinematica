# Cinematica

A movie and TV show discovery platform powered by the TMDB API. Browse trending titles, search for content, watch trailers, and save items to a personal watchlist.

## Features

- **Trending carousel** — auto-playing hero slideshow of top-rated movies & TV shows
- **Browse & filter** — dedicated pages for Movies and TV Shows with Popular / Top Rated tabs
- **Search** — find any movie or TV show by title
- **Detail pages** — backdrop, poster, ratings, genres, overview, cast, and trailer playback
- **Watchlist** — save and manage titles (requires sign-in)
- **Auth** — sign-in / sign-up via Clerk (modal-based)
- **Responsive** — fully mobile-friendly with a collapsible hamburger menu

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | Clerk |
| Database | PostgreSQL via Prisma |
| API | TMDB |
| Animations | Framer Motion, Embla Carousel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [TMDB API key](https://www.themoviedb.org/settings/api)
- A [Clerk](https://clerk.com) project (publishable + secret key)
- A PostgreSQL database URL

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env .env.local
```

Required variables in `.env.local`:

```
TMDB_API_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
```

```bash
# Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── page.tsx          # Home — hero + trending rows
├── movies/           # Movies listing (Popular / Top Rated)
├── tv/               # TV Shows listing
├── movie/[id]/       # Movie detail page
├── tv/[id]/          # TV Show detail page
├── search/           # Search results
├── watchlist/        # User's saved items
└── actions/          # Server actions (watchlist CRUD)
components/
├── Navbar.tsx        # Sticky nav with mobile drawer
├── Hero.tsx          # Auto-playing hero carousel
├── MediaCard.tsx     # Poster card (grid item)
├── MediaRow.tsx      # Horizontal grid section
├── MediaListTabs.tsx # Tabbed grid (Popular / Top Rated)
├── SearchBar.tsx     # Search input
└── media/            # Detail page components (MediaHero, CastRow, TrailerModal, WatchlistButton)
```

## License

MIT
