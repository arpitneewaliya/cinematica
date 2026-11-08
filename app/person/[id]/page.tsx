import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPersonDetails,
  getPersonCombinedCredits,
  getPersonExternalIds,
  TMDBItem,
} from "@/lib/tmdb";
import { PersonSidebar } from "@/components/person/PersonSidebar";
import { PersonBio } from "@/components/person/PersonBio";
import { PersonKnownFor } from "@/components/person/PersonKnownFor";
import { PersonFilmography } from "@/components/person/PersonFilmography";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonDetails(id);

  if (!person || !person.name) {
    return {
      title: "Person Not Found - Cinematica",
    };
  }

  const cleanBio = person.biography
    ? person.biography.slice(0, 160).replace(/\s+/g, " ").trim() + "..."
    : `Explore movies, TV shows, and biography for ${person.name} on Cinematica.`;

  return {
    title: `${person.name} - Cinematica`,
    description: cleanBio,
  };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;

  const [person, credits, externalIds] = await Promise.all([
    getPersonDetails(id),
    getPersonCombinedCredits(id),
    getPersonExternalIds(id),
  ]);

  if (!person || !person.name) {
    notFound();
  }

  // Deduplicate and rank "Known For" media items
  const rawCast = credits?.cast || [];
  const seenIds = new Set<string>();
  const uniqueCast = rawCast.filter((item) => {
    const key = `${item.media_type}-${item.id}`;
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return Boolean(item.poster_path);
  });

  const knownForItems: TMDBItem[] = uniqueCast
    .sort((a, b) => {
      const scoreA = (a.vote_count || 0) * (a.vote_average || 1);
      const scoreB = (b.vote_count || 0) * (b.vote_average || 1);
      return scoreB - scoreA;
    })
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      title: item.title,
      name: item.name,
      overview: item.overview || "",
      poster_path: item.poster_path || "",
      backdrop_path: item.backdrop_path || "",
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average || 0,
      media_type: item.media_type,
    }));

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-24 md:pt-28">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Sticky Sidebar: Image & Personal Details */}
          <PersonSidebar person={person} externalIds={externalIds} />

          {/* Right Main Content Panel */}
          <div className="flex-1 min-w-0 space-y-10 w-full">
            {/* Header: Name and Department */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                  {person.known_for_department || "Cast Member"}
                </span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {person.name}
              </h1>
            </div>

            {/* Biography */}
            <div className="space-y-3">
              <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                Biography
              </h2>
              <PersonBio biography={person.biography} name={person.name} />
            </div>

            {/* Known For Carousel */}
            {knownForItems.length > 0 && <PersonKnownFor items={knownForItems} />}

            {/* Complete Filmography with Filters */}
            <PersonFilmography credits={credits?.cast || []} />
          </div>
        </div>
      </div>
    </main>
  );
}

