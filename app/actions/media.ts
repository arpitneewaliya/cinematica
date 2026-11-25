"use server";

import {
  TMDBItem,
  PaginatedMediaResponse,
  WatchProvider,
  fetchMediaChunkData,
  discoverMedia,
  fetchExploreCategoryPage,
  discoverMediaAdvanced,
  fetchAvailableWatchProviders,
  searchMedia,
  fetchTrendingMedia,
  getMovieVideos,
  getTVVideos,
  getMediaWatchProviders,
  getTVSeasonDetails,
  CountryWatchProviders,
} from "@/lib/tmdb";
import {
  DiscoverFilters,
  DiscoverSortOption,
  ExploreCategory,
  ExploreMediaType,
} from "@/lib/explore-config";
import { Video, TVSeasonDetails } from "@/types/tmdb";

export async function fetchExploreCategoryAction(
  mediaType: ExploreMediaType,
  category: ExploreCategory,
  page: number = 1
): Promise<PaginatedMediaResponse> {
  try {
    return await fetchExploreCategoryPage(mediaType, category, page);
  } catch (error) {
    console.error("Error fetching explore category:", error);
    return { items: [], page: 1, totalPages: 1, totalResults: 0 };
  }
}

export async function discoverMediaAction(
  mediaType: ExploreMediaType,
  params: {
    category: ExploreCategory;
    sortBy: DiscoverSortOption;
    page: number;
    filters: DiscoverFilters;
    watchRegion?: string;
  }
): Promise<PaginatedMediaResponse> {
  try {
    return await discoverMediaAdvanced(mediaType, params);
  } catch (error) {
    console.error("Error running advanced media discovery:", error);
    return { items: [], page: 1, totalPages: 1, totalResults: 0 };
  }
}

export async function getRegionWatchProvidersAction(
  mediaType: ExploreMediaType,
  region: string = "US"
): Promise<WatchProvider[]> {
  try {
    return await fetchAvailableWatchProviders(mediaType, region);
  } catch (error) {
    console.error("Error fetching regional watch providers:", error);
    return [];
  }
}

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

export async function getTrendingMediaAction(): Promise<TMDBItem[]> {
  try {
    const items = await fetchTrendingMedia();
    return items.slice(0, 6);
  } catch (error) {
    console.error("Error fetching trending media:", error);
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

export async function getWatchProvidersAction(
  id: number,
  mediaType: "movie" | "tv",
  countryCode: string = "US"
): Promise<CountryWatchProviders | null> {
  try {
    const data = await getMediaWatchProviders(String(id), mediaType);
    return data?.results[countryCode] || null;
  } catch (error) {
    console.error(`Error fetching watch providers for ${mediaType} ${id} (${countryCode}):`, error);
    return null;
  }
}

export async function getTVSeasonAction(
  tvId: number,
  seasonNumber: number
): Promise<TVSeasonDetails | null> {
  try {
    return await getTVSeasonDetails(tvId, seasonNumber);
  } catch (error) {
    console.error(`Error fetching season ${seasonNumber} for TV ${tvId}:`, error);
    return null;
  }
}
