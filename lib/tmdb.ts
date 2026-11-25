const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: 'movie' | 'tv';
  genre_ids?: number[];
  logo_path?: string;
  logo_aspect_ratio?: number;
}

interface TMDBResponse {
  results: TMDBItem[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

export interface PaginatedMediaResponse {
  items: TMDBItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

interface TMDBImageAsset {
  file_path: string;
  iso_639_1?: string | null;
  vote_average: number;
  vote_count: number;
  aspect_ratio: number;
}

interface TMDBImagesResponse {
  logos?: TMDBImageAsset[];
}

export async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY is not defined in environment variables');
    // Return empty results if API key is not present so the app doesn't crash
    return { results: [] } as unknown as T;
  }

  try {
    const isV4Token = TMDB_API_KEY.length > 50;
    const separator = endpoint.includes('?') ? '&' : '?';
    
    const url = isV4Token 
      ? `${BASE_URL}${endpoint}${separator}language=en-US`
      : `${BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}&language=en-US`;

    const options: RequestInit = {
      next: { revalidate: 3600 } // Revalidate every hour
    };

    if (isV4Token) {
      options.headers = {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_KEY}`
      };
    }

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const res = await fetch(url, options);

        if (!res.ok) {
          console.error(`Failed to fetch from TMDB: ${res.status}`);
          return { results: [] } as unknown as T;
        }

        return await res.json();
      } catch (err) {
        if (attempt === maxAttempts) throw err;
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }

    return { results: [] } as unknown as T;
  } catch (error) {
    console.error(`Fetch error for TMDB endpoint ${endpoint}:`, error);
    return { results: [] } as unknown as T;
  }
}

export async function fetchTrendingMovies(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/trending/movie/day');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchTrendingTvShows(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/trending/tv/day');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'tv' }));
}

export async function fetchTrendingMedia(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/trending/all/day');
  return data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .slice(0, 20);
}

export function getPreferredLogo<
  T extends { iso_639_1?: string | null; vote_count: number; vote_average: number }
>(logos: T[] = []): T | undefined {
  return logos.toSorted((first, second) => {
    const languageScore = (logo: T) =>
      logo.iso_639_1 === 'en' ? 2 : logo.iso_639_1 === null ? 1 : 0;

    return (
      languageScore(second) - languageScore(first) ||
      second.vote_count - first.vote_count ||
      second.vote_average - first.vote_average
    );
  })[0];
}

export async function fetchHeroMedia(): Promise<TMDBItem[]> {
  const trendingItems = (await fetchTrendingMedia()).slice(0, 5);

  return Promise.all(
    trendingItems.map(async (item) => {
      const images = await fetchFromTMDB<TMDBImagesResponse>(
        `/${item.media_type}/${item.id}/images?include_image_language=en,null`
      );
      const logo = getPreferredLogo(images.logos);

      return logo
        ? { ...item, logo_path: logo.file_path, logo_aspect_ratio: logo.aspect_ratio }
        : item;
    })
  );
}

export function getImageUrl(
  path: string | null | undefined,
  size: 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
) {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export async function fetchPopularMovies(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/movie/popular');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchTopRatedMovies(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/movie/top_rated');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchTopRatedTvShows(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/tv/top_rated');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'tv' }));
}

export async function fetchNowPlayingMovies(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/movie/now_playing');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchMoviesByGenre(genreIds: number[]): Promise<TMDBItem[]> {
  if (genreIds.length === 0) return [];

  const data = await fetchFromTMDB<TMDBResponse>(
    `/discover/movie?sort_by=popularity.desc&with_genres=${genreIds.join('|')}`
  );
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchMoviesByIds(movieIds: number[]): Promise<TMDBItem[]> {
  const movies = await Promise.all(
    movieIds.map(async (id) => {
      const movie = await fetchFromTMDB<TMDBItem>(`/movie/${id}`);
      return movie?.id ? { ...movie, media_type: 'movie' as const } : null;
    })
  );

  return movies.filter((movie) => movie !== null);
}

import {
  MovieDetails,
  TVDetails,
  TVSeasonDetails,
  CreditsResponse,
  VideosResponse,
  PersonDetails,
  PersonExternalIds,
  PersonCreditsResponse,
  PersonSearchResult,
  PersonImagesResponse,
  AggregateCreditsResponse,
} from "@/types/tmdb";

export async function getPersonDetails(id: string | number): Promise<PersonDetails | null> {
  return fetchFromTMDB<PersonDetails>(`/person/${id}`).catch(() => null);
}

export async function getPersonCombinedCredits(id: string | number): Promise<PersonCreditsResponse | null> {
  return fetchFromTMDB<PersonCreditsResponse>(`/person/${id}/combined_credits`).catch(() => null);
}

export async function getPersonExternalIds(id: string | number): Promise<PersonExternalIds | null> {
  return fetchFromTMDB<PersonExternalIds>(`/person/${id}/external_ids`).catch(() => null);
}

export async function getPersonImages(id: string | number): Promise<PersonImagesResponse | null> {
  return fetchFromTMDB<PersonImagesResponse>(`/person/${id}/images`).catch(() => null);
}

interface TMDBPersonSearchResponse {
  results: PersonSearchResult[];
}

export async function searchPeople(query: string): Promise<PersonSearchResult[]> {
  if (!query) return [];
  const data = await fetchFromTMDB<TMDBPersonSearchResponse>(`/search/person?query=${encodeURIComponent(query)}`);
  return data?.results || [];
}

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  return fetchFromTMDB<MovieDetails>(`/movie/${id}`).catch(() => null);
}

export async function getTVDetails(id: string): Promise<TVDetails | null> {
  return fetchFromTMDB<TVDetails>(`/tv/${id}`).catch(() => null);
}

export async function getFullMovieDetails(id: string): Promise<MovieDetails | null> {
  try {
    const data = await fetchFromTMDB<MovieDetails>(
      `/movie/${id}?append_to_response=credits,videos,images,recommendations,similar,release_dates,reviews&include_image_language=en,null`
    );
    return data && typeof data.id === "number" ? data : null;
  } catch {
    return null;
  }
}

export async function getFullTVDetails(id: string): Promise<TVDetails | null> {
  try {
    const data = await fetchFromTMDB<TVDetails>(
      `/tv/${id}?append_to_response=aggregate_credits,credits,videos,images,recommendations,similar,content_ratings,reviews&include_image_language=en,null`
    );
    return data && typeof data.id === "number" ? data : null;
  } catch {
    return null;
  }
}

export async function getTVSeasonDetails(
  tvId: string | number,
  seasonNumber: number
): Promise<TVSeasonDetails | null> {
  try {
    const data = await fetchFromTMDB<TVSeasonDetails>(
      `/tv/${tvId}/season/${seasonNumber}`
    );
    return data && Array.isArray(data.episodes) ? data : null;
  } catch {
    return null;
  }
}

export async function getMovieCredits(id: string): Promise<CreditsResponse | null> {
  return fetchFromTMDB<CreditsResponse>(`/movie/${id}/credits`).catch(() => null);
}

export async function getTVCredits(id: string): Promise<CreditsResponse | null> {
  try {
    const data = await fetchFromTMDB<AggregateCreditsResponse>(`/tv/${id}/aggregate_credits`);
    if (!data?.cast) return null;

    // Normalize aggregate cast into CastMember shape
    const cast = data.cast.map((member) => ({
      id: member.id,
      name: member.name,
      profile_path: member.profile_path,
      character: member.roles?.map((r) => r.character).filter(Boolean).join(", ") || "",
    }));

    return { cast };
  } catch {
    return null;
  }
}

export async function getMovieVideos(id: string): Promise<VideosResponse | null> {
  return fetchFromTMDB<VideosResponse>(`/movie/${id}/videos`).catch(() => null);
}

export async function getTVVideos(id: string): Promise<VideosResponse | null> {
  return fetchFromTMDB<VideosResponse>(`/tv/${id}/videos`).catch(() => null);
}

export async function getMovieRecommendations(id: string): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>(`/movie/${id}/recommendations`).catch(() => null);
  return data?.results.slice(0, 10).map(item => ({ ...item, media_type: 'movie' })) || [];
}

export async function getTVRecommendations(id: string): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>(`/tv/${id}/recommendations`).catch(() => null);
  return data?.results.slice(0, 10).map(item => ({ ...item, media_type: 'tv' })) || [];
}

export async function searchMedia(query: string): Promise<TMDBItem[]> {
  if (!query) return [];
  const data = await fetchFromTMDB<TMDBResponse>(`/search/multi?query=${encodeURIComponent(query)}`);
  
  // Filter out people and items without images
  return data.results
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .filter(item => item.poster_path || item.backdrop_path)
    .slice(0, 20); // Return top 20 results
}

export async function fetchMediaChunkData(
  mediaType: 'movie' | 'tv',
  category: 'popular' | 'top_rated',
  chunkIndex: number,
  chunkSize: number = 30
): Promise<TMDBItem[]> {
  const startIndex = (chunkIndex - 1) * chunkSize;
  const endIndex = chunkIndex * chunkSize - 1;
  
  // TMDB pages are 1-indexed and return 20 items per page
  const startPage = Math.floor(startIndex / 20) + 1;
  const endPage = Math.floor(endIndex / 20) + 1;
  
  const pagePromises: Promise<TMDBResponse>[] = [];
  for (let page = startPage; page <= endPage; page++) {
    pagePromises.push(fetchFromTMDB<TMDBResponse>(`/${mediaType}/${category}?page=${page}`));
  }
  
  const responses = await Promise.all(pagePromises);
  
  // Flatten results and map media_type
  const allItems = responses.flatMap(res => res.results || []).map(item => ({ ...item, media_type: mediaType }));
  
  // Calculate relative start index in the combined array
  const relativeStartIndex = startIndex % 20;
  
  return allItems.slice(relativeStartIndex, relativeStartIndex + chunkSize);
}

export async function discoverMedia(
  mediaType: 'movie' | 'tv',
  sortBy: 'popularity.desc' | 'vote_average.desc',
  page: number,
  genres: number[] = [],
  minRating: number = 0,
  year: string = ''
): Promise<TMDBItem[]> {
  let endpoint = `/discover/${mediaType}?page=${page}`;

  if (sortBy === 'popularity.desc') {
    endpoint += '&sort_by=popularity.desc';
  } else {
    // For top rated, sort by vote average and require minimum 100 votes to filter noise
    endpoint += '&sort_by=vote_average.desc&vote_count.gte=100';
  }

  if (genres.length > 0) {
    // TMDb uses pipe | for OR matching
    endpoint += `&with_genres=${genres.join('|')}`;
  }

  if (minRating > 0) {
    endpoint += `&vote_average.gte=${minRating}`;
  }

  if (year) {
    if (year.endsWith('s')) {
      // Decade filter, e.g. "1990s"
      const startDecade = parseInt(year.substring(0, 4), 10);
      const endDecade = startDecade + 9;
      
      const dateGte = `${startDecade}-01-01`;
      const dateLte = `${endDecade}-12-31`;
      
      if (mediaType === 'movie') {
        endpoint += `&primary_release_date.gte=${dateGte}&primary_release_date.lte=${dateLte}`;
      } else {
        endpoint += `&first_air_date.gte=${dateGte}&first_air_date.lte=${dateLte}`;
      }
    } else {
      // Specific year filter
      if (mediaType === 'movie') {
        endpoint += `&primary_release_year=${year}`;
      } else {
        endpoint += `&first_air_date_year=${year}`;
      }
    }
  }

  const response = await fetchFromTMDB<{ results: TMDBItem[] }>(endpoint);
  return (response.results || []).map(item => ({ ...item, media_type: mediaType }));
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface CountryWatchProviders {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  free?: WatchProvider[];
}

export interface WatchProvidersResponse {
  id: number;
  results: Record<string, CountryWatchProviders>;
}

export async function getMediaWatchProviders(id: string, type: "movie" | "tv"): Promise<WatchProvidersResponse | null> {
  return fetchFromTMDB<WatchProvidersResponse>(`/${type}/${id}/watch/providers`).catch(() => null);
}

import {
  DECADES,
  DiscoverFilters,
  DiscoverSortOption,
  ExploreCategory,
  ExploreMediaType,
  getRuntimePresets,
} from "@/lib/explore-config";

function toISODateOffset(offsetDays: number = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function fetchExploreSpotlight(
  mediaType: ExploreMediaType,
  limit: number = 5
): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>(`/trending/${mediaType}/day`);
  const candidates = (data.results || [])
    .filter((item) => Boolean(item.backdrop_path))
    .slice(0, limit)
    .map((item) => ({ ...item, media_type: mediaType }));

  return Promise.all(
    candidates.map(async (item) => {
      const images = await fetchFromTMDB<TMDBImagesResponse>(
        `/${mediaType}/${item.id}/images?include_image_language=en,null`
      );
      const logo = getPreferredLogo(images.logos);
      return logo
        ? { ...item, logo_path: logo.file_path, logo_aspect_ratio: logo.aspect_ratio }
        : item;
    })
  );
}

export async function fetchExploreCategoryPage(
  mediaType: ExploreMediaType,
  category: ExploreCategory,
  page: number = 1
): Promise<PaginatedMediaResponse> {
  const safePage = Math.min(Math.max(page, 1), 500);
  let endpoint = `/${mediaType}/popular?page=${safePage}`;

  if (category === "trending") {
    endpoint = `/trending/${mediaType}/week?page=${safePage}`;
  } else if (category === "top_rated") {
    endpoint = `/${mediaType}/top_rated?page=${safePage}`;
  } else if (mediaType === "movie") {
    if (category === "in_theaters") endpoint = `/movie/now_playing?page=${safePage}`;
    else if (category === "upcoming") endpoint = `/movie/upcoming?page=${safePage}`;
    else if (category === "popular") endpoint = `/movie/popular?page=${safePage}`;
  } else {
    if (category === "on_the_air") endpoint = `/tv/on_the_air?page=${safePage}`;
    else if (category === "airing_today") endpoint = `/tv/airing_today?page=${safePage}`;
    else if (category === "popular") endpoint = `/tv/popular?page=${safePage}`;
  }

  const data = await fetchFromTMDB<TMDBResponse>(endpoint);
  const items = (data.results || []).map((item) => ({
    ...item,
    media_type: mediaType,
  }));

  return {
    items,
    page: data.page || safePage,
    totalPages: Math.min(data.total_pages || 1, 500),
    totalResults: data.total_results || items.length,
  };
}

export async function discoverMediaAdvanced(
  mediaType: ExploreMediaType,
  params: {
    category: ExploreCategory;
    sortBy: DiscoverSortOption;
    page: number;
    filters: DiscoverFilters;
    watchRegion?: string;
  }
): Promise<PaginatedMediaResponse> {
  const { category, sortBy, page, filters, watchRegion = "US" } = params;
  const safePage = Math.min(Math.max(page, 1), 500);
  const sp = new URLSearchParams();

  sp.set("page", String(safePage));
  sp.set("include_adult", "false");

  const mappedSort =
    sortBy === "release_date.desc"
      ? mediaType === "movie"
        ? "primary_release_date.desc"
        : "first_air_date.desc"
      : sortBy === "release_date.asc"
        ? mediaType === "movie"
          ? "primary_release_date.asc"
          : "first_air_date.asc"
        : sortBy === "revenue.desc" && mediaType !== "movie"
          ? "popularity.desc"
          : sortBy;

  sp.set("sort_by", mappedSort);

  if (filters.minVotes > 0) {
    sp.set("vote_count.gte", String(filters.minVotes));
  } else if (sortBy === "vote_average.desc") {
    sp.set("vote_count.gte", "150");
  } else if (sortBy === "release_date.desc" || sortBy === "release_date.asc") {
    sp.set("vote_count.gte", "5");
  }

  const todayISO = toISODateOffset(0);
  const hasExplicitEra = Boolean(filters.decade || filters.yearFrom || filters.yearTo);

  if (hasExplicitEra) {
    let fromYear = filters.yearFrom;
    let toYear = filters.yearTo;

    if (filters.decade) {
      const decadeObj = DECADES.find((d) => d.value === filters.decade);
      if (decadeObj) {
        fromYear = decadeObj.from;
        toYear = decadeObj.to;
      }
    } else if (fromYear && toYear && Number(fromYear) > Number(toYear)) {
      [fromYear, toYear] = [toYear, fromYear];
    }

    const dateField = mediaType === "movie" ? "primary_release_date" : "first_air_date";
    if (fromYear) sp.set(`${dateField}.gte`, `${fromYear}-01-01`);
    if (toYear) sp.set(`${dateField}.lte`, `${toYear}-12-31`);
  } else {
    if (mediaType === "movie") {
      if (category === "upcoming") {
        sp.set("primary_release_date.gte", toISODateOffset(1));
      } else if (category === "in_theaters") {
        sp.set("primary_release_date.gte", toISODateOffset(-45));
        sp.set("primary_release_date.lte", toISODateOffset(7));
        sp.set("with_release_type", "2|3");
      } else if (sortBy === "release_date.desc") {
        sp.set("primary_release_date.lte", todayISO);
      }
    } else {
      if (category === "on_the_air") {
        sp.set("air_date.gte", todayISO);
        sp.set("air_date.lte", toISODateOffset(14));
      } else if (category === "airing_today") {
        sp.set("air_date.gte", todayISO);
        sp.set("air_date.lte", todayISO);
      } else if (sortBy === "release_date.desc") {
        sp.set("first_air_date.lte", todayISO);
      }
    }
  }

  if (filters.genres.length > 0) {
    const separator = filters.genreMode === "and" ? "," : "|";
    sp.set("with_genres", filters.genres.join(separator));
  }

  if (filters.providers.length > 0 || filters.monetization) {
    sp.set("watch_region", watchRegion);
    if (filters.providers.length > 0) {
      sp.set("with_watch_providers", filters.providers.join("|"));
    }
    if (filters.monetization) {
      sp.set(
        "with_watch_monetization_types",
        filters.monetization === "rent" ? "rent|buy" : filters.monetization
      );
    }
  }

  if (filters.minRating > 0) {
    sp.set("vote_average.gte", String(filters.minRating));
  }

  if (filters.runtimePreset) {
    const preset = getRuntimePresets(mediaType).find(
      (r) => r.value === filters.runtimePreset
    );
    if (preset?.min !== undefined) sp.set("with_runtime.gte", String(preset.min));
    if (preset?.max !== undefined) sp.set("with_runtime.lte", String(preset.max));
  }

  if (filters.language) {
    sp.set("with_original_language", filters.language);
  }

  if (mediaType === "movie" && filters.certification) {
    sp.set("certification_country", "US");
    sp.set("certification", filters.certification);
  }

  if (mediaType === "tv") {
    if (filters.tvStatus) sp.set("with_status", filters.tvStatus);
    if (filters.tvType) sp.set("with_type", filters.tvType);
    if (filters.networks.length > 0) {
      sp.set("with_networks", filters.networks.join("|"));
    }
  }

  const data = await fetchFromTMDB<TMDBResponse>(`/discover/${mediaType}?${sp.toString()}`);
  const items = (data.results || []).map((item) => ({
    ...item,
    media_type: mediaType,
  }));

  return {
    items,
    page: data.page || safePage,
    totalPages: Math.min(data.total_pages || 1, 500),
    totalResults: data.total_results || items.length,
  };
}

interface RawWatchProvider extends WatchProvider {
  display_priorities?: Record<string, number>;
}

export async function fetchAvailableWatchProviders(
  mediaType: ExploreMediaType,
  region: string = "US"
): Promise<WatchProvider[]> {
  const data = await fetchFromTMDB<{ results?: RawWatchProvider[] }>(
    `/watch/providers/${mediaType}?watch_region=${encodeURIComponent(region)}`
  );

  const seen = new Set<number>();
  const unique = (data.results || []).filter((p) => {
    if (!p.logo_path || seen.has(p.provider_id)) return false;
    seen.add(p.provider_id);
    return true;
  });

  unique.sort((a, b) => {
    const prioA = a.display_priorities?.[region] ?? a.display_priority ?? 999;
    const prioB = b.display_priorities?.[region] ?? b.display_priority ?? 999;
    return prioA - prioB;
  });

  return unique.slice(0, 30).map((p) => ({
    provider_id: p.provider_id,
    provider_name: p.provider_name,
    logo_path: p.logo_path,
    display_priority: p.display_priorities?.[region] ?? p.display_priority ?? 999,
  }));
}
