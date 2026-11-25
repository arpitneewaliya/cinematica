export interface TMDBRelatedItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBImageAssetDetail {
  file_path: string;
  aspect_ratio: number;
  width: number;
  height: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
}

export interface TMDBReview {
  id: string;
  author: string;
  author_details: {
    name?: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  url?: string;
}

export interface TVSeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  vote_average?: number;
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
}

export interface TVSeasonDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null;
  episodes: TVEpisode[];
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  runtime: number | null;
  budget: number;
  revenue: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  tagline?: string;
  status?: string;
  original_language?: string;
  homepage?: string | null;
  spoken_languages?: SpokenLanguage[];
  credits?: CreditsResponse;
  videos?: VideosResponse;
  images?: {
    backdrops?: TMDBImageAssetDetail[];
    logos?: TMDBImageAssetDetail[];
  };
  recommendations?: {
    results: TMDBRelatedItem[];
  };
  similar?: {
    results: TMDBRelatedItem[];
  };
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
        type: number;
      }>;
    }>;
  };
  reviews?: {
    results: TMDBReview[];
  };
}

export interface TVDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date?: string | null;
  vote_average: number;
  vote_count?: number;
  number_of_episodes: number;
  number_of_seasons: number;
  episode_run_time?: number[];
  in_production?: boolean;
  status: string;
  networks: Network[];
  genres: Genre[];
  tagline?: string;
  original_language?: string;
  homepage?: string | null;
  spoken_languages?: SpokenLanguage[];
  created_by?: Array<{
    id: number;
    name: string;
    profile_path: string | null;
  }>;
  seasons?: TVSeasonSummary[];
  aggregate_credits?: AggregateCreditsResponse;
  credits?: CreditsResponse;
  videos?: VideosResponse;
  images?: {
    backdrops?: TMDBImageAssetDetail[];
    logos?: TMDBImageAssetDetail[];
  };
  recommendations?: {
    results: TMDBRelatedItem[];
  };
  similar?: {
    results: TMDBRelatedItem[];
  };
  content_ratings?: {
    results: Array<{
      iso_3166_1: string;
      rating: string;
    }>;
  };
  reviews?: {
    results: TMDBReview[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface AggregateCastMember {
  id: number;
  name: string;
  profile_path: string | null;
  roles: Array<{
    character: string;
    episode_count: number;
  }>;
  total_episode_count: number;
  order: number;
}

export interface AggregateCreditsResponse {
  cast: AggregateCastMember[];
}

export interface CreditsResponse {
  cast: CastMember[];
  crew?: CrewMember[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface VideosResponse {
  results: Video[];
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  known_for_department: string;
  place_of_birth: string | null;
  profile_path: string | null;
  popularity: number;
  also_known_as: string[];
  homepage: string | null;
  imdb_id: string | null;
}

export interface PersonExternalIds {
  imdb_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
  facebook_id: string | null;
  tiktok_id: string | null;
  youtube_id: string | null;
}

export interface PersonCreditCastItem {
  id: number;
  title?: string;
  name?: string;
  character?: string;
  media_type: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  overview: string;
  genre_ids?: number[];
  order?: number;
  episode_count?: number;
}

export interface PersonCreditCrewItem {
  id: number;
  title?: string;
  name?: string;
  department?: string;
  job?: string;
  media_type: "movie" | "tv";
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  overview?: string;
  genre_ids?: number[];
  episode_count?: number;
}

export interface PersonCreditsResponse {
  cast: PersonCreditCastItem[];
  crew: PersonCreditCrewItem[];
}

export interface FullPersonDetails extends PersonDetails {
  combined_credits?: PersonCreditsResponse;
  external_ids?: PersonExternalIds;
  images?: PersonImagesResponse;
}

export interface PersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  media_type?: string;
  known_for?: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: "movie" | "tv";
  }>;
}

export interface PersonProfileImage {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  vote_average: number;
  vote_count: number;
}

export interface PersonImagesResponse {
  id: number;
  profiles: PersonProfileImage[];
}


