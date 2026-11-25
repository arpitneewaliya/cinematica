import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFullPersonDetails } from "@/lib/tmdb";
import { analyzePersonCredits } from "@/lib/person-credits";
import { PersonHero } from "@/components/person/PersonHero";
import { PersonKnownFor } from "@/components/person/PersonKnownFor";
import { PersonInteractiveBody } from "@/components/person/PersonInteractiveBody";
import { PersonPhotos } from "@/components/person/PersonPhotos";

export const revalidate = 86400; // Cache person profiles for 24 hours

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = await getFullPersonDetails(id);

  if (!person || !person.name) {
    return {
      title: "Person Not Found — Cinematica",
    };
  }

  const cleanBio = person.biography
    ? `${person.biography.slice(0, 155).replace(/\s+/g, " ").trim()}...`
    : `Explore films, series, career analytics, and biography for ${person.name} on Cinematica.`;

  return {
    title: `${person.name} — Cinematica`,
    description: cleanBio,
  };
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params;
  const person = await getFullPersonDetails(id);

  if (!person || !person.name) {
    notFound();
  }

  const analysis = analyzePersonCredits(person, person.combined_credits);
  const portraits = person.images?.profiles || [];

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070708] pb-16">
      <PersonHero
        person={person}
        externalIds={person.external_ids}
        heroBackdrop={analysis.heroBackdrop}
        activeCrafts={analysis.activeCrafts}
        yearsActiveLabel={analysis.stats.yearsActiveLabel}
        totalCreditsCount={analysis.stats.totalDistinctTitles}
      />

      {analysis.knownFor.length > 0 && (
        <PersonKnownFor credits={analysis.knownFor} />
      )}

      {portraits.length > 0 && (
        <PersonPhotos images={portraits} name={person.name} />
      )}

      <PersonInteractiveBody
        person={person}
        credits={analysis.credits}
        stats={analysis.stats}
        defaultHideSelf={analysis.defaultHideSelf}
      />
    </main>
  );
}
