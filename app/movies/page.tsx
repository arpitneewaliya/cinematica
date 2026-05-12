import { fetchPopularMovies, fetchTopRatedMovies } from "@/lib/tmdb";
import { MediaListTabs } from "@/components/MediaListTabs";

export const metadata = {
  title: "Movies - Cinematica",
  description: "Browse popular and top rated movies.",
};

export default async function MoviesPage() {
  const [popular, topRated] = await Promise.all([
    fetchPopularMovies(),
    fetchTopRatedMovies(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <MediaListTabs 
        title="Movies" 
        popular={popular} 
        topRated={topRated} 
      />
    </main>
  );
}
