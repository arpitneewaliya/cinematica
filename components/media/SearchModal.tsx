"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  Star,
  Film,
  Tv,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles,
  CornerDownLeft,
} from "lucide-react";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { getTrendingMediaAction } from "@/app/actions/media";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";

const RECENT_SEARCHES_KEY = "cinematica_recent_searches";
const MAX_RECENT_SEARCHES = 6;

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = "all" | "movie" | "tv";

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<TMDBItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [trendingItems, setTrendingItems] = React.useState<TMDBItem[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = React.useState(false);

  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  const loadRecentSearches = React.useCallback(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch {
      // LocalStorage access may fail in private mode
    }
  }, []);

  // Save query to recent searches
  const saveRecentSearch = React.useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        const list: string[] = stored ? JSON.parse(stored) : [];
        const filtered = list.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        setRecentSearches(updated);
      } catch {
        // Ignore storage errors
      }
    },
    []
  );

  // Remove a single recent search
  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((item) => item !== term);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      // Ignore storage errors
    }
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch {
      // Ignore storage errors
    }
  };

  // Focus input and fetch initial data when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
      loadRecentSearches();

      // Fetch trending media if not yet cached
      if (trendingItems.length === 0) {
        setIsTrendingLoading(true);
        getTrendingMediaAction()
          .then((items) => setTrendingItems(items))
          .catch((err) => console.error(err))
          .finally(() => setIsTrendingLoading(false));
      }
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setActiveIndex(-1);
        setActiveFilter("all");
      }, 0);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, loadRecentSearches, trendingItems.length]);

  // Debounced search logic
  React.useEffect(() => {
    if (!query.trim()) {
      setTimeout(() => {
        setResults([]);
        setIsLoading(false);
      }, 0);
      return;
    }

    setTimeout(() => {
      setIsLoading(true);
    }, 0);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const searchResults: TMDBItem[] = res.ok ? await res.json() : [];
        // Show up to 12 items to give rich, ample results
        setResults(searchResults.slice(0, 12));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setActiveIndex(-1);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Filtered results based on active tab
  const filteredResults = React.useMemo(() => {
    if (activeFilter === "all") return results;
    return results.filter((item) => item.media_type === activeFilter);
  }, [results, activeFilter]);

  const movieCount = React.useMemo(
    () => results.filter((item) => item.media_type === "movie").length,
    [results]
  );
  const tvCount = React.useMemo(
    () => results.filter((item) => item.media_type === "tv").length,
    [results]
  );

  // Navigate to full search page
  const handleViewAllResults = React.useCallback(() => {
    if (query.trim()) {
      saveRecentSearch(query);
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, saveRecentSearch, onClose, router]);

  // Handle arrow keys and navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev < filteredResults.length - 1 ? prev + 1 : prev;
          scrollActiveItemIntoView(next);
          return next;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : -1;
          scrollActiveItemIntoView(next);
          return next;
        });
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && filteredResults[activeIndex]) {
          const selectedItem = filteredResults[activeIndex];
          saveRecentSearch(selectedItem.title || selectedItem.name || query);
          onClose();
          router.push(`/${selectedItem.media_type}/${selectedItem.id}`);
        } else if (query.trim()) {
          handleViewAllResults();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex, filteredResults, query, router, onClose, saveRecentSearch, handleViewAllResults]);

  const scrollActiveItemIntoView = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elements = container.querySelectorAll("[data-search-item]");
      const activeEl = elements[index] as HTMLElement;

      if (activeEl) {
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const elemTop = activeEl.offsetTop;
        const elemBottom = elemTop + activeEl.clientHeight;

        if (elemTop < containerTop) {
          container.scrollTop = elemTop;
        } else if (elemBottom > containerBottom) {
          container.scrollTop = elemBottom - container.clientHeight;
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center items-start p-0 md:p-4 md:pt-[8vh] transition-all duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 z-0 hidden md:block" onClick={onClose} />

      {/* Modal Card Shell */}
      <div className="relative z-10 w-full md:max-w-3xl bg-zinc-950/95 md:border md:border-white/10 md:rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-[100dvh] md:h-auto md:max-h-[82vh] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200">
        
        {/* Top Header: Input & Search Action */}
        <div className="relative border-b border-white/10 flex items-center bg-zinc-900/60 pt-[env(safe-area-inset-top)] px-2 md:px-3">
          <button
            onClick={onClose}
            className="md:hidden h-11 w-11 flex items-center justify-center text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="pointer-events-none text-zinc-400 hidden md:flex items-center pl-3 pr-1">
            <Search className="w-5 h-5 text-primary" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, actors..."
            className="w-full bg-transparent h-14 md:h-16 pl-2 md:pl-2 pr-12 md:pr-20 text-white placeholder-zinc-500 focus:outline-none text-base md:text-lg font-medium"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 md:right-16 top-[env(safe-area-inset-top)] bottom-0 my-auto h-9 w-9 flex items-center justify-center text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <div className="absolute right-4 text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-700/80 px-2 py-0.5 rounded-md pointer-events-none hidden md:flex items-center gap-1 font-mono">
            ESC
          </div>
        </div>

        {/* Filter Pills (Shown whenever there is an active search query) */}
        {query.trim().length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-zinc-900/40 text-xs shrink-0 overflow-x-auto hide-scrollbar">
            <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1">
              Filter
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setActiveIndex(-1);
              }}
              className={cn(
                "px-3 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs",
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
              <span>All</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  activeFilter === "all" ? "bg-black/25 text-white" : "bg-white/10 text-zinc-400"
                )}
              >
                {results.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter("movie");
                setActiveIndex(-1);
              }}
              className={cn(
                "px-3 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs",
                activeFilter === "movie"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Film className="w-3 h-3" />
              <span>Movies</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  activeFilter === "movie" ? "bg-black/25 text-white" : "bg-white/10 text-zinc-400"
                )}
              >
                {movieCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveFilter("tv");
                setActiveIndex(-1);
              }}
              className={cn(
                "px-3 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs",
                activeFilter === "tv"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Tv className="w-3 h-3" />
              <span>TV Shows</span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full",
                  activeFilter === "tv" ? "bg-black/25 text-white" : "bg-white/10 text-zinc-400"
                )}
              >
                {tvCount}
              </span>
            </button>
          </div>
        )}

        {/* Results / Content Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-3 md:p-4 min-h-[220px] max-h-[60vh] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent space-y-4"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Searching Cinematica...</p>
            </div>
          )}

          {/* Empty Query: Initial Discovery View (Recent Searches + Trending) */}
          {!isLoading && !query.trim() && (
            <div className="space-y-6 py-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
                      >
                        <Clock className="w-3 h-3 text-zinc-500 group-hover:text-primary transition-colors" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-zinc-500 hover:text-white p-0.5 rounded-full transition-colors"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Recommendations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Trending Today
                </div>

                {isTrendingLoading ? (
                  <div className="flex items-center justify-center py-8 text-zinc-500 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading trending suggestions...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trendingItems.slice(0, 6).map((item) => {
                      const releaseInfo = getMediaReleaseInfo(item.release_date || item.first_air_date);
                      return (
                        <Link
                          key={item.id}
                          href={`/${item.media_type}/${item.id}`}
                          onClick={() => {
                            saveRecentSearch(item.title || item.name || "");
                            onClose();
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 group cursor-pointer"
                        >
                          <div className="relative w-11 h-16 bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-white/5">
                            {item.poster_path ? (
                              <Image
                                src={getImageUrl(item.poster_path, "w500")}
                                alt={item.title || item.name || ""}
                                fill
                                sizes="48px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                {item.media_type === "movie" ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                              {item.title || item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {releaseInfo.year && (
                                <span className="text-xs text-zinc-400 font-medium">
                                  {releaseInfo.year}
                                </span>
                              )}
                              <Badge
                                variant="secondary"
                                className="text-[9px] uppercase tracking-wider px-1.5 py-0 border-none rounded-full font-semibold bg-white/10 text-zinc-300"
                              >
                                {item.media_type === "movie" ? "Movie" : "TV"}
                              </Badge>
                              {item.vote_average > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold tabular-nums">
                                  <Star className="w-3 h-3 fill-current" />
                                  {formatMediaRating(item.vote_average)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Results Found */}
          {!isLoading && query.trim() && filteredResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-zinc-500 gap-3 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <X className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-base font-medium text-white">
                  No {activeFilter === "all" ? "results" : activeFilter === "movie" ? "movies" : "TV shows"} found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Try checking for typos, changing your filter, or press Enter to run a broader full search.
                </p>
              </div>
              <button
                type="button"
                onClick={handleViewAllResults}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
              >
                <span>Search full library for &ldquo;{query}&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Search Result Rows */}
          {!isLoading && filteredResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <span>
                  {activeFilter === "all"
                    ? "Top Matching Titles"
                    : activeFilter === "movie"
                    ? "Matching Movies"
                    : "Matching TV Shows"}
                </span>
                <span>{filteredResults.length} matches</span>
              </div>

              {filteredResults.map((item, idx) => {
                const releaseInfo = getMediaReleaseInfo(item.release_date || item.first_air_date);
                const isItemActive = idx === activeIndex;

                return (
                  <Link
                    key={item.id}
                    href={`/${item.media_type}/${item.id}`}
                    onClick={() => {
                      saveRecentSearch(item.title || item.name || query);
                      onClose();
                    }}
                    data-search-item
                    className={cn(
                      "group flex items-start gap-4 p-3 rounded-2xl transition-all duration-200 cursor-pointer border",
                      isItemActive
                        ? "bg-white/10 border-white/15 ring-1 ring-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] md:scale-[1.005]"
                        : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                    )}
                  >
                    {/* Enlarged Poster (56x80px) */}
                    <div className="relative w-14 h-20 bg-zinc-900 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                      {item.poster_path ? (
                        <Image
                          src={getImageUrl(item.poster_path, "w500")}
                          alt={item.title || item.name || ""}
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                          {item.media_type === "movie" ? (
                            <Film className="w-5 h-5" />
                          ) : (
                            <Tv className="w-5 h-5" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rich Details */}
                    <div className="flex-1 min-w-0 pr-2">
                      {/* Top Row: Title, Year, Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-heading font-semibold text-base text-white group-hover:text-primary transition-colors truncate">
                          {item.title || item.name}
                        </span>
                        {releaseInfo.year && (
                          <span className="text-xs text-zinc-400 font-medium shrink-0 tabular-nums">
                            ({releaseInfo.year}{releaseInfo.isUpcoming ? " · Upcoming" : ""})
                          </span>
                        )}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] uppercase tracking-wider px-2 py-0.5 border rounded-full font-semibold",
                            item.media_type === "movie"
                              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"
                              : "bg-teal-500/15 text-teal-300 border-teal-500/20"
                          )}
                        >
                          {item.media_type === "movie" ? "Movie" : "TV"}
                        </Badge>
                        {item.vote_average > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold tabular-nums ml-auto">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {formatMediaRating(item.vote_average)}
                          </div>
                        )}
                      </div>

                      {/* Multiline 2-line Clamped Synopsis */}
                      <p className="line-clamp-2 text-xs md:text-sm text-zinc-400 leading-relaxed mt-1.5">
                        {item.overview || "No synopsis available for this title."}
                      </p>
                    </div>

                    {/* Active / Hover Enter Hint */}
                    <div className="hidden sm:flex self-center shrink-0 items-center justify-center w-8 h-8 rounded-lg text-zinc-500 group-hover:text-white group-hover:bg-white/10 transition-colors">
                      <CornerDownLeft className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Bar: Sticky "View All Results" & Shortcut Guide */}
        <div className="border-t border-white/10 bg-zinc-900/70 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs text-zinc-400">
          {query.trim() ? (
            <button
              type="button"
              onClick={handleViewAllResults}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              <span>View all results for &ldquo;{query}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Discover the best movies and TV shows</span>
            </div>
          )}

          {/* Desktop Shortcut hints */}
          <div className="hidden md:flex items-center gap-3 text-[11px] text-zinc-500 font-medium">
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[10px]">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[10px]">
                ESC
              </kbd>{" "}
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
