import { fetchTrendingMedia, fetchTrendingMovies, fetchTrendingTvShows } from "@/lib/tmdb";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { getUserWatchlist } from "@/app/actions/watchlist";

export const metadata = {
  title: "Cinematica - Discover Movies & TV Shows",
  description: "Explore top trending movies and TV shows.",
};

export default async function Home() {
  const [heroItems, movies, tvShows] = await Promise.all([
    fetchTrendingMedia(),
    fetchTrendingMovies(),
    fetchTrendingTvShows(),
  ]);

  let initialWatchlistIds: number[] = [];
  try {
    const watchlist = await getUserWatchlist();
    initialWatchlistIds = watchlist.map(item => item.mediaId);
  } catch {
    // User is probably not logged in, ignore
  }

  const hasData = movies.length > 0 || tvShows.length > 0;

  // TMDb's all-media trending endpoint provides the mixed movie/TV ranking.
  const topHeroItems = heroItems.slice(0, 5);
  const featuredKeys = new Set(topHeroItems.map(item => `${item.media_type}:${item.id}`));
  const remainingMovies = movies.filter(item => !featuredKeys.has(`movie:${item.id}`));
  const remainingTvShows = tvShows.filter(item => !featuredKeys.has(`tv:${item.id}`));

  return (
    <main className="min-h-screen bg-background pb-16">
      {hasData ? (
        <>
          {topHeroItems.length > 0 && <Hero items={topHeroItems} />}
          <div className="space-y-4 md:space-y-8 mt-4 md:-mt-12 relative z-20">
            <MediaRow title="Trending Movies" items={remainingMovies} initialWatchlistIds={initialWatchlistIds} />
            <MediaRow title="Trending TV Shows" items={remainingTvShows} initialWatchlistIds={initialWatchlistIds} />
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
