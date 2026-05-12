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

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY is not defined in environment variables');
    // Return empty results if API key is not present so the app doesn't crash
    return { results: [] } as any;
  }

  try {
    const isV4Token = TMDB_API_KEY.length > 50;
    
    const url = isV4Token 
      ? `${BASE_URL}${endpoint}?language=en-US`
      : `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`;

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
  return data.results.slice(0, 10).map(item => ({ ...item, media_type: 'movie' }));
}

export async function fetchTrendingTvShows(): Promise<TMDBItem[]> {
  const data = await fetchFromTMDB<TMDBResponse>('/trending/tv/day');
  return data.results.slice(0, 10).map(item => ({ ...item, media_type: 'tv' }));
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
