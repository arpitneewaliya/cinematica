import { getTVDetails, getTVCredits, getTVVideos, getTVRecommendations } from "@/lib/tmdb";
import { MediaHero } from "@/components/media/MediaHero";
import { CastRow } from "@/components/media/CastRow";
import { MediaRow } from "@/components/MediaRow";

export const revalidate = 86400; // Cache on Vercel CDN for 24 hours

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const details = await getTVDetails(id);
  if (!details) return { title: "Not Found" };
  return {
    title: `${details.name} - Cinematica`,
    description: details.overview,
  };
}

export default async function TVShowPage({ params }: Props) {
  const { id } = await params;
  const [details, credits, videos, recommendations] = await Promise.all([
    getTVDetails(id),
    getTVCredits(id),
    getTVVideos(id),
    getTVRecommendations(id),
  ]);

  if (!details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-3xl font-bold">TV Show not found</h1>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <MediaHero
        id={details.id}
        type="tv"
        title={details.name}
        overview={details.overview}
        backdropPath={details.backdrop_path}
        posterPath={details.poster_path}
        rating={details.vote_average}
        releaseDate={details.first_air_date}
        genres={details.genres}
        videos={videos?.results || []}
      />
      
      {credits && <CastRow cast={credits.cast} />}
      
      {recommendations && recommendations.length > 0 && (
        <div className="mt-8">
          <MediaRow title="You Might Also Like" items={recommendations} />
        </div>
      )}
    </main>
  );
}
