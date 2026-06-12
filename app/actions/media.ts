"use server";

import { TMDBItem, fetchMediaChunkData } from "@/lib/tmdb";

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
