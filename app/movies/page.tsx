import { fetchMediaChunkData } from "@/lib/tmdb";
import { MediaListTabs } from "@/components/MediaListTabs";

export const revalidate = 3600; // Cache page on Vercel CDN for 1 hour

export const metadata = {
  title: "Movies - Cinematica",
  description: "Browse popular and top rated movies.",
};

export default async function MoviesPage() {
  const [popular, topRated] = await Promise.all([
    fetchMediaChunkData("movie", "popular", 1),
    fetchMediaChunkData("movie", "top_rated", 1),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <MediaListTabs 
        title="Movies" 
        mediaType="movie"
        popular={popular} 
        topRated={topRated}
      />
    </main>
  );
}
