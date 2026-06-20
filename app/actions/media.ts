"use server";

import { TMDBItem, fetchMediaChunkData, discoverMedia, searchMedia, getMovieVideos, getTVVideos } from "@/lib/tmdb";
import { Video } from "@/types/tmdb";

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

export async function searchMediaAction(query: string): Promise<TMDBItem[]> {
  try {
    const items = await searchMedia(query);
    return items;
  } catch (error) {
    console.error("Error searching media:", error);
    return [];
  }
}

export async function getMediaTrailerAction(
  id: number,
  mediaType: "movie" | "tv"
): Promise<Video | null> {
  try {
    const data = mediaType === "movie"
      ? await getMovieVideos(String(id))
      : await getTVVideos(String(id));

    if (!data || !data.results) return null;

    // Find YouTube trailer or any YouTube video
    const trailer = data.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || data.results.find((v) => v.site === "YouTube");

    return trailer || null;
  } catch (error) {
    console.error("Error fetching media trailer:", error);
    return null;
  }
}
