"use client";

import { useState } from "react";
import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";

interface MediaRowProps {
  title: string;
  items: TMDBItem[];
  initialWatchlistIds?: number[];
}

export function MediaRow({ title, items, initialWatchlistIds = [] }: MediaRowProps) {
  const [watchlistSet, setWatchlistSet] = useState<Set<number>>(new Set(initialWatchlistIds));

  if (!items || items.length === 0) return null;

  const handleToggleWatchlist = (id: number) => {
    setWatchlistSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-1.5 h-8 bg-primary rounded-full inline-block"></span>
            {title}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {items.map((item) => (
            <MediaCard 
              key={item.id} 
              item={item} 
              isSaved={watchlistSet.has(item.id)}
              onToggleWatchlist={handleToggleWatchlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
