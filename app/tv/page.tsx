import { fetchPopularTvShows, fetchTopRatedTvShows } from "@/lib/tmdb";
import { MediaListTabs } from "@/components/MediaListTabs";

export const metadata = {
  title: "TV Shows - Cinematica",
  description: "Browse popular and top rated TV shows.",
};

export default async function TvShowsPage() {
  const [popular, topRated] = await Promise.all([
    fetchPopularTvShows(),
    fetchTopRatedTvShows(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <MediaListTabs 
        title="TV Shows" 
        popular={popular} 
        topRated={topRated} 
      />
    </main>
  );
}
