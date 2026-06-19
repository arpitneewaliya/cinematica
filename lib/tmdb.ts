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
}

interface TMDBResponse {
  results: TMDBItem[];
}

export async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY is not defined in environment variables');
    // Return empty results if API key is not present so the app doesn't crash
    return { results: [] } as any;
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

    const res = await fetch(url, options);

    if (!res.ok) {
      console.error(`Failed to fetch from TMDB: ${res.status}`);
      return { results: [] } as any;
    }

    return res.json();
  } catch (error) {
    console.error(`Fetch error for TMDB endpoint ${endpoint}:`, error);
    return { results: [] } as any;
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

export function getImageUrl(path: string, size: 'w500' | 'original' = 'w500') {
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

export async function fetchPopularTvShows(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/tv/popular');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'tv' }));
}

export async function fetchTopRatedTvShows(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/tv/top_rated');
  return data.results.slice(0, 20).map(item => ({ ...item, media_type: 'tv' }));
}

import { MovieDetails, TVDetails, CreditsResponse, VideosResponse } from "@/types/tmdb";

export async function getMovieDetails(id: string): Promise<MovieDetails | null> {
  return fetchFromTMDB<MovieDetails>(`/movie/${id}`).catch(() => null);
}

export async function getTVDetails(id: string): Promise<TVDetails | null> {
  return fetchFromTMDB<TVDetails>(`/tv/${id}`).catch(() => null);
}

export async function getMovieCredits(id: string): Promise<CreditsResponse | null> {
  return fetchFromTMDB<CreditsResponse>(`/movie/${id}/credits`).catch(() => null);
}

export async function getTVCredits(id: string): Promise<CreditsResponse | null> {
  return fetchFromTMDB<CreditsResponse>(`/tv/${id}/credits`).catch(() => null);
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
