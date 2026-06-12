import { fetchMediaChunkData } from "@/lib/tmdb";
import { MediaListTabs } from "@/components/MediaListTabs";

export const metadata = {
  title: "TV Shows - Cinematica",
  description: "Browse popular and top rated TV shows.",
};

export default async function TvShowsPage() {
  const [popular, topRated] = await Promise.all([
    fetchMediaChunkData("tv", "popular", 1),
    fetchMediaChunkData("tv", "top_rated", 1),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <MediaListTabs 
        title="TV Shows" 
        mediaType="tv"
        popular={popular} 
        topRated={topRated} 
      />
    </main>
  );
}
