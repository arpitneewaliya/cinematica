import { searchMedia } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { SearchX } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  return {
    title: `Search results for "${query}" - Cinematica`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  
  const results = await searchMedia(query);

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 pt-20 md:pt-24">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <span className="w-2 h-8 md:h-10 bg-primary rounded-full inline-block shrink-0"></span>
          <span>Search Results for</span> <span className="text-primary">"{query}"</span>
        </h1>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
              <SearchX className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">No results found</h2>
            <p className="text-gray-400 max-w-md">
              We couldn't find any movies or TV shows matching "{query}". Try adjusting your search or checking for typos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {results.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
