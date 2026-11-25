import Link from "next/link";
import {
  getFullTVDetails,
  getPreferredLogo,
  getTVSeasonDetails,
  type TMDBItem,
} from "@/lib/tmdb";
import type { CastMember } from "@/types/tmdb";
import { MediaWatchProvider } from "@/components/media/MediaWatchContext";
import { MediaHero, type KeyCrewCredit } from "@/components/media/MediaHero";
import { PersonalWatchLog } from "@/components/media/PersonalWatchLog";
import { MediaDetailsGrid } from "@/components/media/MediaDetailsGrid";
import { SeasonEpisodeBrowser } from "@/components/media/SeasonEpisodeBrowser";
import { CastRow } from "@/components/media/CastRow";
import { MediaGallery } from "@/components/media/MediaGallery";
import { MediaReviews } from "@/components/media/MediaReviews";
import { MediaRail } from "@/components/MediaRail";

export const revalidate = 86400; // Cache on Vercel CDN for 24 hours

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const details = await getFullTVDetails(id);
  if (!details) return { title: "Not Found — Cinematica" };
  return {
    title: `${details.name} — Cinematica`,
    description: details.overview,
  };
}

export default async function TVShowPage({ params }: Props) {
  const { id } = await params;
  const details = await getFullTVDetails(id);

  if (!details) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#070708] px-4 text-center">
        <h1 className="font-heading text-3xl font-bold text-white">Series not found</h1>
        <p className="text-sm text-zinc-400">
          We couldn&apos;t locate this series in the catalog.
        </p>
        <Link
          href="/tv"
          className="rounded-full border border-white/15 bg-white/[0.07] px-5 py-2 text-xs font-semibold text-white hover:bg-white/14 transition-colors"
        >
          Browse Series
        </Link>
      </main>
    );
  }

  const seasons = details.seasons ?? [];
  const firstRegularSeason =
    seasons.find((s) => s.season_number > 0) || seasons[0];
  const initialSeason = firstRegularSeason
    ? await getTVSeasonDetails(details.id, firstRegularSeason.season_number)
    : null;

  const preferredLogo = getPreferredLogo(details.images?.logos);

  const ratingResults = details.content_ratings?.results ?? [];
  const certification =
    ratingResults.find((r) => r.iso_3166_1 === "US")?.rating ||
    ratingResults.find((r) => r.rating)?.rating ||
    null;

  const keyCrew: KeyCrewCredit[] = (details.created_by ?? [])
    .slice(0, 3)
    .map((creator) => ({
      id: creator.id,
      name: creator.name,
      role: "Created by",
    }));

  // Normalize aggregate cast (fallback to standard credits cast)
  const normalizedCast: CastMember[] = details.aggregate_credits?.cast?.length
    ? details.aggregate_credits.cast.map((member) => ({
        id: member.id,
        name: member.name,
        profile_path: member.profile_path,
        character:
          member.roles
            ?.map((r) => r.character)
            .filter(Boolean)
            .slice(0, 2)
            .join(", ") || "",
      }))
    : details.credits?.cast ?? [];

  // Merge recommendations with similar fallback
  const recItems = details.recommendations?.results ?? [];
  const simItems = details.similar?.results ?? [];
  const seenIds = new Set<number>([details.id]);
  const moreLikeThis: TMDBItem[] = [];
  for (const item of [...recItems, ...simItems]) {
    if (seenIds.has(item.id) || !item.poster_path) continue;
    seenIds.add(item.id);
    moreLikeThis.push({
      id: item.id,
      title: item.title,
      name: item.name,
      overview: item.overview,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path || "",
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      media_type: "tv",
      genre_ids: item.genre_ids,
    });
    if (moreLikeThis.length >= 18) break;
  }

  const episodeRuntime = details.episode_run_time?.[0] ?? null;

  return (
    <MediaWatchProvider
      mediaId={details.id}
      mediaType="tv"
      title={details.name}
      posterPath={details.poster_path}
      backdropPath={details.backdrop_path}
      releaseDate={details.first_air_date}
      runtime={episodeRuntime}
    >
      <main className="min-h-screen overflow-x-clip bg-[#070708] pb-16">
        <MediaHero
          id={details.id}
          type="tv"
          title={details.name}
          overview={details.overview}
          backdropPath={details.backdrop_path}
          posterPath={details.poster_path}
          rating={details.vote_average}
          voteCount={details.vote_count}
          releaseDate={details.first_air_date}
          lastAirDate={details.last_air_date}
          runtime={episodeRuntime}
          numberOfSeasons={details.number_of_seasons}
          numberOfEpisodes={details.number_of_episodes}
          status={details.status}
          inProduction={details.in_production}
          tagline={details.tagline}
          certification={certification}
          genres={details.genres}
          videos={details.videos?.results || []}
          logoPath={preferredLogo?.file_path}
          logoAspectRatio={preferredLogo?.aspect_ratio}
          keyCrew={keyCrew}
        />

        <PersonalWatchLog />

        <MediaDetailsGrid
          id={details.id}
          type="tv"
          status={details.status}
          releaseDate={details.first_air_date}
          lastAirDate={details.last_air_date}
          runtime={episodeRuntime}
          originalLanguage={details.original_language}
          numberOfSeasons={details.number_of_seasons}
          numberOfEpisodes={details.number_of_episodes}
          networks={details.networks}
          homepage={details.homepage}
        />

        {seasons.length > 0 && (
          <SeasonEpisodeBrowser
            tvId={details.id}
            seasons={seasons}
            initialSeason={initialSeason}
          />
        )}

        {normalizedCast.length > 0 && <CastRow cast={normalizedCast} />}

        <MediaGallery
          videos={details.videos?.results || []}
          backdrops={details.images?.backdrops || []}
          title={details.name}
        />

        <MediaReviews reviews={details.reviews?.results || []} />

        {moreLikeThis.length > 0 && (
          <div className="pt-4">
            <MediaRail
              title="More Like This"
              eyebrow="Curated Recommendations"
              items={moreLikeThis}
              exploreHref="/tv"
            />
          </div>
        )}
      </main>
    </MediaWatchProvider>
  );
}
