@AGENTS.md

# Cinematica - Developer Guide

## Overview
Cinematica is a modern, responsive web application for discovering trending, popular, and top-rated movies and TV shows. It utilizes the TMDb (The Movie Database) API for its media data.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server & Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, CSS Variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react & react-icons (e.g., `BiMoviePlay`)
- **Animations/Carousel**: embla-carousel-react, embla-carousel-autoplay

## Project Structure
- `app/`: Next.js App Router pages and layouts.
  - `page.tsx`: Homepage with auto-playing Hero carousel and Top 5 trending lists.
  - `movies/page.tsx`: Popular and Top Rated movies.
  - `tv/page.tsx`: Popular and Top Rated TV shows.
  - `layout.tsx`: Root layout including the global `Navbar` and forced dark mode.
- `components/`: React components.
  - `ui/`: shadcn/ui base components (Button, Badge, Card, Carousel, Tabs, Skeleton).
  - `Hero.tsx`: Slideshow component for the homepage.
  - `MediaCard.tsx`: Reusable card for displaying media posters and details.
  - `MediaRow.tsx`: Grid layout for displaying lists of MediaCards.
  - `MediaListTabs.tsx`: Client component utilizing Tabs to switch between Popular and Top Rated.
  - `Navbar.tsx`: Global sticky navigation.
- `lib/`: Utility functions.
  - `tmdb.ts`: All data fetching logic from TMDb API. Handles both v3 API keys and v4 Bearer tokens.
  - `utils.ts`: Tailwind class merging utility (`cn`).

## Build & Dev Commands
- **Install dependencies**: `npm install`
- **Run Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Start Production Server**: `npm start`
- **Linting**: `npm run lint`

## Environment Variables
Create a `.env.local` file in the root directory:
```env
# Supports either TMDb API Key (v3) or API Read Access Token (v4)
TMDB_API_KEY=your_api_key_or_token_here
```

## Design Philosophy
- **Cinematic Aesthetic**: Deep dark mode (`#0a0a0a`), heavy use of glassmorphism (`backdrop-blur`), and subtle gradients.
- **Interactivity**: Micro-animations on hover (scaling, glows) to provide a premium feel.
- **Error Handling**: Graceful fallbacks in `tmdb.ts` to prevent build crashes if the API token is missing or rate-limited.
- **Image Optimization**: Always utilize Next.js `<Image>` component configured with `image.tmdb.org` in `next.config.ts`.
