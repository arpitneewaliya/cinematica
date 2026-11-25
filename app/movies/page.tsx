import { Suspense } from "react";
import { fetchExploreCategoryPage, fetchExploreSpotlight } from "@/lib/tmdb";
import { ExploreSpotlight } from "@/components/explore/ExploreSpotlight";
import { ExploreCatalog } from "@/components/explore/ExploreCatalog";

export const revalidate = 3600; // Cache page on Vercel CDN for 1 hour

export const metadata = {
  title: "Movies — Cinematica",
  description:
    "Discover trending, in-theater, upcoming, and top-rated films with streaming availability and advanced filters.",
};

export default async function MoviesPage() {
  const [spotlightItems, initialCatalog] = await Promise.all([
    fetchExploreSpotlight("movie", 5),
    fetchExploreCategoryPage("movie", "trending", 1),
  ]);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070708] pb-16">
      <ExploreSpotlight items={spotlightItems} mediaType="movie" />
      <Suspense fallback={<div className="min-h-[60vh] bg-[#070708]" />}>
        <ExploreCatalog mediaType="movie" initialData={initialCatalog} />
      </Suspense>
    </main>
  );
}
