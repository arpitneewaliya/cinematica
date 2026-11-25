import Link from "next/link";
import { getFullMovieDetails, getPreferredLogo, type TMDBItem } from "@/lib/tmdb";
import { MediaWatchProvider } from "@/components/media/MediaWatchContext";
import { MediaHero, type KeyCrewCredit } from "@/components/media/MediaHero";
import { PersonalWatchLog } from "@/components/media/PersonalWatchLog";
import { MediaDetailsGrid } from "@/components/media/MediaDetailsGrid";
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
  const details = await getFullMovieDetails(id);
  if (!details) return { title: "Not Found — Cinematica" };
  return {
    title: `${details.title} — Cinematica`,
    description: details.overview,
  };
}

export default async function MoviePage({ params }: Props) {
  const { id } = await params;
  const details = await getFullMovieDetails(id);

  if (!details) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#070708] px-4 text-center">
        <h1 className="font-heading text-3xl font-bold text-white">Film not found</h1>
        <p className="text-sm text-zinc-400">
          We couldn&apos;t locate this film in the catalog.
        </p>
        <Link
          href="/movies"
          className="rounded-full border border-white/15 bg-white/[0.07] px-5 py-2 text-xs font-semibold text-white hover:bg-white/14 transition-colors"
        >
          Browse Movies
        </Link>
      </main>
    );
  }

  const preferredLogo = getPreferredLogo(details.images?.logos);

  // Extract US certification (or fallback to first available non-empty certification)
  const releaseResults = details.release_dates?.results ?? [];
  const usRelease = releaseResults.find((r) => r.iso_3166_1 === "US");
  const certification =
    usRelease?.release_dates.find((d) => d.certification)?.certification ||
    releaseResults
      .flatMap((r) => r.release_dates)
      .find((d) => d.certification)?.certification ||
    null;

  // Extract key directors and writers
  const crew = details.credits?.crew ?? [];
  const keyCrew: KeyCrewCredit[] = [];
  const seenCrewKeys = new Set<string>();
  const addCrew = (role: string, filterFn: (job: string) => boolean, limit: number) => {
    let added = 0;
    for (const member of crew) {
      if (added >= limit) break;
      if (filterFn(member.job)) {
        const key = `${role}:${member.id}`;
        if (!seenCrewKeys.has(key)) {
          seenCrewKeys.add(key);
          keyCrew.push({ id: member.id, name: member.name, role });
          added++;
        }
      }
    }
  };
  addCrew("Directed by", (job) => job === "Director", 2);
  addCrew("Written by", (job) => job === "Screenplay" || job === "Writer", 2);

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
      media_type: "movie",
      genre_ids: item.genre_ids,
    });
    if (moreLikeThis.length >= 18) break;
  }

  return (
    <MediaWatchProvider
      mediaId={details.id}
      mediaType="movie"
      title={details.title}
      posterPath={details.poster_path}
      backdropPath={details.backdrop_path}
      releaseDate={details.release_date}
      runtime={details.runtime}
    >
      <main className="min-h-screen overflow-x-clip bg-[#070708] pb-16">
        <MediaHero
          id={details.id}
          type="movie"
          title={details.title}
          overview={details.overview}
          backdropPath={details.backdrop_path}
          posterPath={details.poster_path}
          rating={details.vote_average}
          voteCount={details.vote_count}
          releaseDate={details.release_date}
          runtime={details.runtime}
          status={details.status}
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
          type="movie"
          status={details.status}
          releaseDate={details.release_date}
          runtime={details.runtime}
          originalLanguage={details.original_language}
          budget={details.budget}
          revenue={details.revenue}
          productionCompanies={details.production_companies}
          homepage={details.homepage}
        />

        {details.credits?.cast && details.credits.cast.length > 0 && (
          <CastRow cast={details.credits.cast} />
        )}

        <MediaGallery
          videos={details.videos?.results || []}
          backdrops={details.images?.backdrops || []}
          title={details.title}
        />

        <MediaReviews reviews={details.reviews?.results || []} />

        {moreLikeThis.length > 0 && (
          <div className="pt-4">
            <MediaRail
              title="More Like This"
              eyebrow="Curated Recommendations"
              items={moreLikeThis}
              exploreHref="/movies"
            />
          </div>
        )}
      </main>
    </MediaWatchProvider>
  );
}
