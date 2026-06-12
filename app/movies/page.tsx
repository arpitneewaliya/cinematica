import { fetchMediaChunkData } from "@/lib/tmdb";
import { MediaListTabs } from "@/components/MediaListTabs";
import { getUserWatchlist } from "@/app/actions/watchlist";

export const metadata = {
  title: "Movies - Cinematica",
  description: "Browse popular and top rated movies.",
};

export default async function MoviesPage() {
  const [popular, topRated] = await Promise.all([
    fetchMediaChunkData("movie", "popular", 1),
    fetchMediaChunkData("movie", "top_rated", 1),
  ]);

  let initialWatchlistIds: number[] = [];
  try {
    const watchlist = await getUserWatchlist();
    initialWatchlistIds = watchlist.map(item => item.mediaId);
  } catch (error) {
    // User is probably not logged in, ignore
  }

  return (
    <main className="min-h-screen bg-background">
      <MediaListTabs 
        title="Movies" 
        mediaType="movie"
        popular={popular} 
        topRated={topRated}
        initialWatchlistIds={initialWatchlistIds}
      />
    </main>
  );
}
