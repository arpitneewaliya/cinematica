import { Suspense } from "react";
import { fetchExploreCategoryPage, fetchExploreSpotlight } from "@/lib/tmdb";
import { ExploreSpotlight } from "@/components/explore/ExploreSpotlight";
import { ExploreCatalog } from "@/components/explore/ExploreCatalog";

export const revalidate = 3600; // Cache page on Vercel CDN for 1 hour

export const metadata = {
  title: "TV Series — Cinematica",
  description:
    "Discover trending, currently airing, and critically acclaimed television series with streaming availability and advanced filters.",
};

export default async function TvShowsPage() {
  const [spotlightItems, initialCatalog] = await Promise.all([
    fetchExploreSpotlight("tv", 5),
    fetchExploreCategoryPage("tv", "trending", 1),
  ]);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070708] pb-16">
      <ExploreSpotlight items={spotlightItems} mediaType="tv" />
      <Suspense fallback={<div className="min-h-[60vh] bg-[#070708]" />}>
        <ExploreCatalog mediaType="tv" initialData={initialCatalog} />
      </Suspense>
    </main>
  );
}
