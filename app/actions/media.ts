"use server";

import { TMDBItem, fetchMediaChunkData, discoverMedia } from "@/lib/tmdb";

export async function fetchMediaChunk(
  mediaType: "movie" | "tv",
  category: "popular" | "top_rated",
  chunkIndex: number
): Promise<TMDBItem[]> {
  try {
    const items = await fetchMediaChunkData(mediaType, category, chunkIndex);
    return items;
  } catch (error) {
    console.error("Error fetching media chunk:", error);
    return [];
  }
}

export async function fetchFilteredMedia(
  mediaType: "movie" | "tv",
  sortBy: "popularity.desc" | "vote_average.desc",
  page: number,
  genres: number[] = [],
  minRating: number = 0,
  year: string = ""
): Promise<TMDBItem[]> {
  try {
    const items = await discoverMedia(mediaType, sortBy, page, genres, minRating, year);
    return items;
  } catch (error) {
    console.error("Error fetching filtered media:", error);
    return [];
  }
}
