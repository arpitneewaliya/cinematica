import { fetchTrendingMovies, fetchTrendingTvShows } from "@/lib/tmdb";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";

export const metadata = {
  title: "Cinematica - Discover Movies & TV Shows",
  description: "Explore top trending movies and TV shows.",
};

export default async function Home() {
  const [movies, tvShows] = await Promise.all([
    fetchTrendingMovies(),
    fetchTrendingTvShows(),
  ]);

  const hasData = movies.length > 0 || tvShows.length > 0;
  
  // Combine and get top 5 for the slideshow
  const topHeroItems = [...movies, ...tvShows]
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-background pb-16">
      {hasData ? (
        <>
          {topHeroItems.length > 0 && <Hero items={topHeroItems} />}
          <div className="space-y-4 md:space-y-8 mt-4 md:-mt-12 relative z-20">
            <MediaRow title="Trending Movies" items={movies.slice(1)} />
            <MediaRow title="Trending TV Shows" items={tvShows} />
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
