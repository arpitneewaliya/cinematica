"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { TMDBItem } from "@/lib/tmdb";
import { MediaRail } from "./MediaRail";

export function WatchlistRail() {
  const { isSignedIn } = useAuth();
  const { items } = useWatchlist();

  const mappedItems = useMemo<TMDBItem[]>(
    () =>
      items
        .filter((item) => item.posterPath)
        .map((item) => ({
          id: item.mediaId,
          title: item.mediaType === "movie" ? item.title : undefined,
          name: item.mediaType === "tv" ? item.title : undefined,
          overview: "",
          poster_path: item.posterPath || "",
          backdrop_path: item.backdropPath || "",
          release_date: item.mediaType === "movie" ? item.releaseDate || undefined : undefined,
          first_air_date: item.mediaType === "tv" ? item.releaseDate || undefined : undefined,
          vote_average: 0,
          media_type: item.mediaType,
        })),
    [items]
  );

  if (!isSignedIn || mappedItems.length === 0) return null;

  return (
    <MediaRail
      title="From Your Watchlist"
      eyebrow="Saved for Later"
      items={mappedItems}
      exploreHref="/watchlist"
      exploreLabel="Open Watchlist"
    />
  );
}
