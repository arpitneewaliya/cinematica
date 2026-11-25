export type ExploreMediaType = "movie" | "tv";

export type MovieCategory =
  | "trending"
  | "popular"
  | "in_theaters"
  | "top_rated"
  | "upcoming";

export type TvCategory =
  | "trending"
  | "popular"
  | "on_the_air"
  | "airing_today"
  | "top_rated";

export type ExploreCategory = MovieCategory | TvCategory;

export type DiscoverSortOption =
  | "popularity.desc"
  | "vote_average.desc"
  | "release_date.desc"
  | "release_date.asc"
  | "vote_count.desc"
  | "revenue.desc";

export type ExploreViewMode = "grid" | "editorial";

export type WatchMonetizationType = "" | "flatrate" | "free" | "rent";

export interface DiscoverFilters {
  genres: number[];
  genreMode: "or" | "and";
  providers: number[];
  monetization: WatchMonetizationType;
  decade: string;
  yearFrom: string;
  yearTo: string;
  minRating: number;
  minVotes: number;
  runtimePreset: string;
  language: string;
  certification: string;
  tvStatus: string;
  tvType: string;
  networks: number[];
  hideWatchlisted: boolean;
  hideWatched: boolean;
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  genres: [],
  genreMode: "or",
  providers: [],
  monetization: "",
  decade: "",
  yearFrom: "",
  yearTo: "",
  minRating: 0,
  minVotes: 0,
  runtimePreset: "",
  language: "",
  certification: "",
  tvStatus: "",
  tvType: "",
  networks: [],
  hideWatchlisted: false,
  hideWatched: false,
};

export interface CategoryOption {
  value: ExploreCategory;
  label: string;
}

export const MOVIE_CATEGORIES: CategoryOption[] = [
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Popular" },
  { value: "in_theaters", label: "In Theaters" },
  { value: "top_rated", label: "Top Rated" },
  { value: "upcoming", label: "Upcoming" },
];

export const TV_CATEGORIES: CategoryOption[] = [
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Popular" },
  { value: "on_the_air", label: "On The Air" },
  { value: "airing_today", label: "Airing Today" },
  { value: "top_rated", label: "Top Rated" },
];

export function getCategoriesForMediaType(mediaType: ExploreMediaType): CategoryOption[] {
  return mediaType === "movie" ? MOVIE_CATEGORIES : TV_CATEGORIES;
}

export interface SortOptionItem {
  value: DiscoverSortOption;
  label: string;
}

export const MOVIE_SORT_OPTIONS: SortOptionItem[] = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
  { value: "vote_count.desc", label: "Most Reviewed" },
  { value: "revenue.desc", label: "Highest Box Office" },
];

export const TV_SORT_OPTIONS: SortOptionItem[] = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Newest First" },
  { value: "release_date.asc", label: "Oldest First" },
  { value: "vote_count.desc", label: "Most Reviewed" },
];

export function getSortOptionsForMediaType(mediaType: ExploreMediaType): SortOptionItem[] {
  return mediaType === "movie" ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS;
}

export interface GenreOption {
  id: number;
  name: string;
}

export const MOVIE_GENRES: GenreOption[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
  { id: 10770, name: "TV Movie" },
];

export const TV_GENRES: GenreOption[] = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

export function getGenresForMediaType(mediaType: ExploreMediaType): GenreOption[] {
  return mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
}

export function getGenreMap(mediaType: ExploreMediaType): Record<number, string> {
  const list = getGenresForMediaType(mediaType);
  return Object.fromEntries(list.map((g) => [g.id, g.name]));
}

export const CURRENT_YEAR = new Date().getFullYear();

export interface DecadeOption {
  value: string;
  label: string;
  from: string;
  to: string;
}

export const DECADES: DecadeOption[] = [
  { value: "2020s", label: "2020s", from: "2020", to: String(CURRENT_YEAR) },
  { value: "2010s", label: "2010s", from: "2010", to: "2019" },
  { value: "2000s", label: "2000s", from: "2000", to: "2009" },
  { value: "1990s", label: "1990s", from: "1990", to: "1999" },
  { value: "1980s", label: "1980s", from: "1980", to: "1989" },
  { value: "1970s", label: "1970s", from: "1970", to: "1979" },
  { value: "classic", label: "Pre-1970", from: "", to: "1969" },
];

export const YEAR_OPTIONS: string[] = Array.from(
  { length: CURRENT_YEAR + 1 - 1940 + 1 },
  (_, index) => String(CURRENT_YEAR + 1 - index)
);

export const RATING_OPTIONS: number[] = [0, 6, 7, 7.5, 8, 8.5];

export interface VoteCountOption {
  value: number;
  label: string;
}

export const VOTE_COUNT_OPTIONS: VoteCountOption[] = [
  { value: 0, label: "Any" },
  { value: 50, label: "50+ Gems" },
  { value: 200, label: "200+" },
  { value: 1000, label: "1K+" },
  { value: 3000, label: "3K+ Hits" },
];

export interface RuntimePresetOption {
  value: string;
  label: string;
  min?: number;
  max?: number;
}

export const MOVIE_RUNTIME_PRESETS: RuntimePresetOption[] = [
  { value: "short", label: "< 90m", max: 89 },
  { value: "standard", label: "90–120m", min: 90, max: 120 },
  { value: "feature", label: "120–150m", min: 120, max: 150 },
  { value: "epic", label: "150m+", min: 150 },
];

export const TV_RUNTIME_PRESETS: RuntimePresetOption[] = [
  { value: "half", label: "< 30m", max: 30 },
  { value: "hour", label: "30–60m", min: 30, max: 60 },
  { value: "long", label: "60m+", min: 60 },
];

export function getRuntimePresets(mediaType: ExploreMediaType): RuntimePresetOption[] {
  return mediaType === "movie" ? MOVIE_RUNTIME_PRESETS : TV_RUNTIME_PRESETS;
}

export interface LanguageOption {
  code: string;
  label: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "zh", label: "Mandarin" },
  { code: "pt", label: "Portuguese" },
  { code: "sv", label: "Swedish" },
  { code: "da", label: "Danish" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
];

export const MOVIE_CERTIFICATIONS: string[] = ["G", "PG", "PG-13", "R", "NC-17"];

export const TV_STATUSES = [
  { value: "0", label: "Returning" },
  { value: "3", label: "Ended" },
  { value: "2", label: "In Production" },
  { value: "4", label: "Canceled" },
];

export const TV_TYPES = [
  { value: "4", label: "Scripted" },
  { value: "2", label: "Miniseries" },
  { value: "0", label: "Documentary" },
  { value: "3", label: "Reality" },
];

export const TV_NETWORKS = [
  { id: 49, name: "HBO" },
  { id: 213, name: "Netflix" },
  { id: 2552, name: "Apple TV+" },
  { id: 88, name: "FX" },
  { id: 174, name: "AMC" },
  { id: 1024, name: "Prime Video" },
  { id: 2739, name: "Disney+" },
  { id: 4, name: "BBC One" },
  { id: 453, name: "Hulu" },
  { id: 67, name: "Showtime" },
  { id: 4330, name: "Paramount+" },
  { id: 3353, name: "Peacock" },
];

export const MONETIZATION_OPTIONS: { value: WatchMonetizationType; label: string }[] = [
  { value: "", label: "All" },
  { value: "flatrate", label: "Stream" },
  { value: "free", label: "Free" },
  { value: "rent", label: "Rent / Buy" },
];

export function getDefaultSortForCategory(category: ExploreCategory): DiscoverSortOption {
  if (category === "top_rated") return "vote_average.desc";
  return "popularity.desc";
}

export function hasServerFilters(filters: DiscoverFilters): boolean {
  return (
    filters.genres.length > 0 ||
    filters.providers.length > 0 ||
    filters.monetization !== "" ||
    filters.decade !== "" ||
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.minRating > 0 ||
    filters.minVotes > 0 ||
    filters.runtimePreset !== "" ||
    filters.language !== "" ||
    filters.certification !== "" ||
    filters.tvStatus !== "" ||
    filters.tvType !== "" ||
    filters.networks.length > 0
  );
}

export function countActiveFilters(filters: DiscoverFilters): number {
  let count = 0;
  count += filters.genres.length;
  count += filters.providers.length;
  if (filters.monetization) count += 1;
  if (filters.decade || filters.yearFrom || filters.yearTo) count += 1;
  if (filters.minRating > 0) count += 1;
  if (filters.minVotes > 0) count += 1;
  if (filters.runtimePreset) count += 1;
  if (filters.language) count += 1;
  if (filters.certification) count += 1;
  if (filters.tvStatus) count += 1;
  if (filters.tvType) count += 1;
  count += filters.networks.length;
  if (filters.hideWatchlisted) count += 1;
  if (filters.hideWatched) count += 1;
  return count;
}

export interface ExploreUrlState {
  category: ExploreCategory;
  sortBy: DiscoverSortOption;
  viewMode: ExploreViewMode;
  filters: DiscoverFilters;
}

function parseIntList(raw: string | null): number[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
    )
  );
}

export function parseExploreSearchParams(
  params: { get(name: string): string | null },
  mediaType: ExploreMediaType
): ExploreUrlState {
  const validCategories = new Set(
    getCategoriesForMediaType(mediaType).map((c) => c.value)
  );
  const validSorts = new Set(
    getSortOptionsForMediaType(mediaType).map((s) => s.value)
  );

  // Backward-compatible legacy ?tab=topRated | ?tab=popular
  const tabParam = params.get("tab");
  const categoryParam = params.get("category");
  let category: ExploreCategory = "trending";
  if (categoryParam && validCategories.has(categoryParam as ExploreCategory)) {
    category = categoryParam as ExploreCategory;
  } else if (tabParam === "topRated") {
    category = "top_rated";
  } else if (tabParam === "popular") {
    category = "popular";
  }

  const defaultSort = getDefaultSortForCategory(category);
  const sortParam = params.get("sort");
  const sortBy: DiscoverSortOption =
    sortParam && validSorts.has(sortParam as DiscoverSortOption)
      ? (sortParam as DiscoverSortOption)
      : defaultSort;

  const viewParam = params.get("view");
  const viewMode: ExploreViewMode = viewParam === "editorial" ? "editorial" : "grid";

  const genres = parseIntList(params.get("genre") || params.get("genres"));
  const genreMode = params.get("genreMode") === "and" ? "and" : "or";
  const providers = parseIntList(params.get("providers"));
  const monParam = params.get("monetization");
  const monetization: WatchMonetizationType =
    monParam === "flatrate" || monParam === "free" || monParam === "rent"
      ? monParam
      : "";

  const decadeParam = params.get("decade") || "";
  const validDecade = DECADES.some((d) => d.value === decadeParam) ? decadeParam : "";

  const yearFromRaw = params.get("yearFrom") || "";
  const yearToRaw = params.get("yearTo") || "";
  const yearFrom = /^\d{4}$/.test(yearFromRaw) ? yearFromRaw : "";
  const yearTo = /^\d{4}$/.test(yearToRaw) ? yearToRaw : "";

  const minRatingRaw = Number(params.get("rating") || 0);
  const minRating = RATING_OPTIONS.includes(minRatingRaw) ? minRatingRaw : 0;

  const minVotesRaw = Number(params.get("votes") || 0);
  const minVotes = VOTE_COUNT_OPTIONS.some((v) => v.value === minVotesRaw)
    ? minVotesRaw
    : 0;

  const runtimeRaw = params.get("runtime") || "";
  const runtimePreset = getRuntimePresets(mediaType).some((r) => r.value === runtimeRaw)
    ? runtimeRaw
    : "";

  const langRaw = params.get("lang") || "";
  const language = LANGUAGES.some((l) => l.code === langRaw) ? langRaw : "";

  const certRaw = params.get("cert") || "";
  const certification =
    mediaType === "movie" && MOVIE_CERTIFICATIONS.includes(certRaw) ? certRaw : "";

  const statusRaw = params.get("status") || "";
  const tvStatus =
    mediaType === "tv" && TV_STATUSES.some((s) => s.value === statusRaw)
      ? statusRaw
      : "";

  const tvTypeRaw = params.get("tvType") || "";
  const tvType =
    mediaType === "tv" && TV_TYPES.some((t) => t.value === tvTypeRaw) ? tvTypeRaw : "";

  const networks = mediaType === "tv" ? parseIntList(params.get("networks")) : [];

  const hideWatchlisted = params.get("hideWatchlist") === "1";
  const hideWatched = params.get("hideWatched") === "1";

  return {
    category,
    sortBy,
    viewMode,
    filters: {
      genres,
      genreMode,
      providers,
      monetization,
      decade: validDecade,
      yearFrom: validDecade ? "" : yearFrom,
      yearTo: validDecade ? "" : yearTo,
      minRating,
      minVotes,
      runtimePreset,
      language,
      certification,
      tvStatus,
      tvType,
      networks,
      hideWatchlisted,
      hideWatched,
    },
  };
}

export function buildExploreQueryString(
  state: ExploreUrlState,
  mediaType: ExploreMediaType
): string {
  const sp = new URLSearchParams();
  const { category, sortBy, viewMode, filters } = state;

  if (category !== "trending") {
    sp.set("category", category);
  }
  if (sortBy !== getDefaultSortForCategory(category)) {
    sp.set("sort", sortBy);
  }
  if (viewMode !== "grid") {
    sp.set("view", viewMode);
  }
  if (filters.genres.length > 0) {
    sp.set("genre", filters.genres.join(","));
  }
  if (filters.genres.length > 1 && filters.genreMode === "and") {
    sp.set("genreMode", "and");
  }
  if (filters.providers.length > 0) {
    sp.set("providers", filters.providers.join(","));
  }
  if (filters.monetization) {
    sp.set("monetization", filters.monetization);
  }
  if (filters.decade) {
    sp.set("decade", filters.decade);
  } else {
    if (filters.yearFrom) sp.set("yearFrom", filters.yearFrom);
    if (filters.yearTo) sp.set("yearTo", filters.yearTo);
  }
  if (filters.minRating > 0) {
    sp.set("rating", String(filters.minRating));
  }
  if (filters.minVotes > 0) {
    sp.set("votes", String(filters.minVotes));
  }
  if (filters.runtimePreset) {
    sp.set("runtime", filters.runtimePreset);
  }
  if (filters.language) {
    sp.set("lang", filters.language);
  }
  if (mediaType === "movie" && filters.certification) {
    sp.set("cert", filters.certification);
  }
  if (mediaType === "tv") {
    if (filters.tvStatus) sp.set("status", filters.tvStatus);
    if (filters.tvType) sp.set("tvType", filters.tvType);
    if (filters.networks.length > 0) sp.set("networks", filters.networks.join(","));
  }
  if (filters.hideWatchlisted) {
    sp.set("hideWatchlist", "1");
  }
  if (filters.hideWatched) {
    sp.set("hideWatched", "1");
  }

  return sp.toString();
}
