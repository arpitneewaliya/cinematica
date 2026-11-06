import {
  fetchMoviesByGenre,
  fetchMoviesByIds,
  fetchHeroMedia,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTopRatedTvShows,
  fetchTrendingMovies,
  fetchTrendingTvShows,
} from "@/lib/tmdb";
import { Hero } from "@/components/Hero";
import { MediaRail } from "@/components/MediaRail";
import { getUserWatchlist } from "@/app/actions/watchlist";

const OSCAR_BEST_PICTURE_WINNERS = [
  238, // The Godfather
  240, // The Godfather Part II
  510, // One Flew Over the Cuckoo's Nest
  279, // Amadeus
  792, // Platoon
  274, // The Silence of the Lambs
  424, // Schindler's List
  6977, // No Country for Old Men
  12405, // Slumdog Millionaire
  496243, // Parasite
];

export const metadata = {
  title: "Cinematica - Discover Movies & TV Shows",
  description: "Explore top trending movies and TV shows.",
};

export default async function Home() {
  const [
    heroItems,
    trendingMovies,
    trendingTvShows,
    awardWinningFilms,
    topRatedMovies,
    topRatedTvShows,
    newReleases,
    popularMovies,
    sciFiFantasy,
  ] = await Promise.all([
    fetchHeroMedia(),
    fetchTrendingMovies(),
    fetchTrendingTvShows(),
    fetchMoviesByIds(OSCAR_BEST_PICTURE_WINNERS),
    fetchTopRatedMovies(),
    fetchTopRatedTvShows(),
    fetchNowPlayingMovies(),
    fetchPopularMovies(),
    fetchMoviesByGenre([878, 14]),
  ]);

  let initialWatchlistIds: number[] = [];
  try {
    const watchlist = await getUserWatchlist();
    initialWatchlistIds = watchlist.map(item => item.mediaId);
  } catch {
    // User is probably not logged in, ignore
  }

  const hasData = heroItems.length > 0 || trendingMovies.length > 0 || trendingTvShows.length > 0;

  // TMDb's all-media trending endpoint provides the mixed movie/TV ranking.
  const topHeroItems = heroItems;
  const featuredKeys = new Set(topHeroItems.map(item => `${item.media_type}:${item.id}`));
  const remainingMovies = trendingMovies.filter(item => !featuredKeys.has(`movie:${item.id}`));
  const remainingTvShows = trendingTvShows.filter(item => !featuredKeys.has(`tv:${item.id}`));

  return (
    <main className="min-h-screen overflow-x-clip bg-[#0a0a0a] pb-16">
      {hasData ? (
        <>
          {topHeroItems.length > 0 && <Hero items={topHeroItems} />}
          <div className="relative z-20 -mt-px space-y-0 rounded-t-[2rem] bg-gradient-to-b from-[#101010] via-[#0a0a0a] to-[#0a0a0a] pt-3 md:rounded-t-[3rem] md:pt-7">
            <MediaRail title="Trending Movies" eyebrow="What everyone is watching" items={remainingMovies} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="Trending TV Shows" eyebrow="Binge-worthy now" items={remainingTvShows} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="Award-Winning Films" eyebrow="Oscar Best Picture winners" items={awardWinningFilms} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="Top-Rated Movies" eyebrow="Critically celebrated" items={topRatedMovies} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="Top-Rated TV Shows" eyebrow="The best on television" items={topRatedTvShows} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="New Releases" eyebrow="Fresh on screen" items={newReleases} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="Popular Movies" eyebrow="Audience favorites" items={popularMovies} initialWatchlistIds={initialWatchlistIds} />
            <MediaRail title="Sci-Fi & Fantasy Spotlight" eyebrow="Escape the ordinary" items={sciFiFantasy} initialWatchlistIds={initialWatchlistIds} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-3xl font-bold mb-4">Welcome to Cinematica</h1>
          <p className="text-muted-foreground max-w-md">
            Please add your TMDB API Key to the .env.local file to see trending movies and TV shows.
          </p>
        </div>
      )}
    </main>
  );
}
