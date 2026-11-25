"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUp, Loader2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { PaginatedMediaResponse, TMDBItem, WatchProvider } from "@/lib/tmdb";
import {
  discoverMediaAction,
  fetchExploreCategoryAction,
  getRegionWatchProvidersAction,
} from "@/app/actions/media";
import { getUserWatchedIds } from "@/app/actions/watched";
import {
  DEFAULT_FILTERS,
  DiscoverFilters,
  DiscoverSortOption,
  ExploreCategory,
  ExploreMediaType,
  ExploreUrlState,
  ExploreViewMode,
  buildExploreQueryString,
  getDefaultSortForCategory,
  hasServerFilters,
  parseExploreSearchParams,
} from "@/lib/explore-config";
import { useCountry } from "@/components/providers/CountryProvider";
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { MediaCard } from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { ExploreCommandBar } from "./ExploreCommandBar";
import { ExploreFilterDrawer } from "./ExploreFilterDrawer";
import { ExploreEditorialCard } from "./ExploreEditorialCard";

interface ExploreCatalogProps {
  mediaType: ExploreMediaType;
  initialData: PaginatedMediaResponse;
}

export function ExploreCatalog({ mediaType, initialData }: ExploreCatalogProps) {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const { country } = useCountry();
  const { isSignedIn } = useAuth();
  const { isSaved } = useWatchlist();

  const initialParsed = React.useMemo(
    () => parseExploreSearchParams(searchParams, mediaType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const isInitialDefaultFeed =
    initialParsed.category === "trending" &&
    initialParsed.sortBy === getDefaultSortForCategory("trending") &&
    !hasServerFilters(initialParsed.filters);

  const [category, setCategory] = React.useState<ExploreCategory>(initialParsed.category);
  const [sortBy, setSortBy] = React.useState<DiscoverSortOption>(initialParsed.sortBy);
  const [viewMode, setViewMode] = React.useState<ExploreViewMode>(initialParsed.viewMode);
  const [filters, setFilters] = React.useState<DiscoverFilters>(initialParsed.filters);

  const [items, setItems] = React.useState<TMDBItem[]>(
    isInitialDefaultFeed ? initialData.items : []
  );
  const [page, setPage] = React.useState<number>(isInitialDefaultFeed ? initialData.page : 1);
  const [totalPages, setTotalPages] = React.useState<number>(
    isInitialDefaultFeed ? initialData.totalPages : 1
  );
  const [totalResults, setTotalResults] = React.useState<number>(
    isInitialDefaultFeed ? initialData.totalResults : 0
  );

  const [isFetching, setIsFetching] = React.useState<boolean>(!isInitialDefaultFeed);
  const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = React.useState<boolean>(false);

  // Regional streaming providers cache
  const [providers, setProviders] = React.useState<WatchProvider[]>([]);
  const [loadedProviderKey, setLoadedProviderKey] = React.useState<string>("");
  const providerCacheRef = React.useRef<Record<string, WatchProvider[]>>({});

  // User watched IDs for "Hide Watched" and editorial badge
  const [watchedIds, setWatchedIds] = React.useState<number[]>([]);

  // Request & URL sync tracking
  const requestIdRef = React.useRef(0);
  const [lastWrittenQuery, setLastWrittenQuery] = React.useState<string>(searchParamsKey);
  const [externalSyncNonce, setExternalSyncNonce] = React.useState<number>(0);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  const basePath = mediaType === "movie" ? "/movies" : "/tv";

  // Fetch regional streaming providers when country or mediaType changes
  const activeProviderKey = `${mediaType}:${country}`;
  const isLoadingProviders = loadedProviderKey !== activeProviderKey;

  React.useEffect(() => {
    const cached = providerCacheRef.current[activeProviderKey];
    if (cached) {
      Promise.resolve().then(() => {
        setProviders(cached);
        setLoadedProviderKey(activeProviderKey);
      });
      return;
    }

    let cancelled = false;
    getRegionWatchProvidersAction(mediaType, country)
      .then((list) => {
        if (cancelled) return;
        providerCacheRef.current[activeProviderKey] = list;
        setProviders(list);
        setLoadedProviderKey(activeProviderKey);
      })
      .catch(() => {
        if (!cancelled) {
          setProviders([]);
          setLoadedProviderKey(activeProviderKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeProviderKey, mediaType, country]);

  // Fetch user's watched IDs when signed in
  React.useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    getUserWatchedIds(mediaType)
      .then((ids) => {
        if (!cancelled) setWatchedIds(ids);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, mediaType]);

  const watchedSet = React.useMemo(
    () => (isSignedIn ? new Set(watchedIds) : new Set<number>()),
    [isSignedIn, watchedIds]
  );

  // Back-to-top button visibility
  React.useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 900);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sync URL cleanly when local state changes
  const syncUrl = React.useCallback(
    (nextState: ExploreUrlState) => {
      const qs = buildExploreQueryString(nextState, mediaType);
      setLastWrittenQuery(qs);
      const targetUrl = qs ? `${basePath}?${qs}` : basePath;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", targetUrl);
      }
    },
    [basePath, mediaType]
  );

  // Run server fetch for page 1 of current state
  const fetchPageOne = React.useCallback(
    async (
      nextCategory: ExploreCategory,
      nextSort: DiscoverSortOption,
      nextFilters: DiscoverFilters,
      region: string
    ) => {
      const currentReqId = ++requestIdRef.current;
      const useDiscover =
        hasServerFilters(nextFilters) ||
        nextSort !== getDefaultSortForCategory(nextCategory);

      try {
        const res = useDiscover
          ? await discoverMediaAction(mediaType, {
              category: nextCategory,
              sortBy: nextSort,
              page: 1,
              filters: nextFilters,
              watchRegion: region,
            })
          : await fetchExploreCategoryAction(mediaType, nextCategory, 1);

        if (currentReqId !== requestIdRef.current) return;
        setItems(res.items);
        setPage(res.page);
        setTotalPages(res.totalPages);
        setTotalResults(res.totalResults);
      } catch (error) {
        console.error("Failed to fetch explore catalog:", error);
      } finally {
        if (currentReqId === requestIdRef.current) {
          setIsFetching(false);
        }
      }
    },
    [mediaType]
  );

  // Initial fetch only if page loaded with URL filters/category other than SSR default
  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (!isInitialDefaultFeed) {
      const timer = window.setTimeout(() => {
        fetchPageOne(category, sortBy, filters, country);
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [isInitialDefaultFeed, fetchPageOne, category, sortBy, filters, country]);

  // React to external Next.js link clicks or browser Back/Forward
  const [prevSearchParamsKey, setPrevSearchParamsKey] = React.useState(searchParamsKey);
  if (prevSearchParamsKey !== searchParamsKey) {
    setPrevSearchParamsKey(searchParamsKey);
    if (searchParamsKey !== lastWrittenQuery) {
      setLastWrittenQuery(searchParamsKey);
      const parsed = parseExploreSearchParams(searchParams, mediaType);
      setCategory(parsed.category);
      setSortBy(parsed.sortBy);
      setViewMode(parsed.viewMode);
      setFilters(parsed.filters);
      setIsFetching(true);
      setExternalSyncNonce((n) => n + 1);
    }
  }

  React.useEffect(() => {
    if (externalSyncNonce === 0) return;
    const timer = window.setTimeout(() => {
      fetchPageOne(category, sortBy, filters, country);
    }, 0);
    return () => window.clearTimeout(timer);
    // Only run when an external searchParams navigation incremented externalSyncNonce
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalSyncNonce]);

  // Re-fetch when country changes while streaming provider/monetization filters are active
  const prevCountryRef = React.useRef(country);
  React.useEffect(() => {
    if (prevCountryRef.current === country) return;
    prevCountryRef.current = country;
    if (filters.providers.length > 0 || filters.monetization !== "") {
      const timer = window.setTimeout(() => {
        setIsFetching(true);
        fetchPageOne(category, sortBy, filters, country);
      }, 50);
      return () => window.clearTimeout(timer);
    }
  }, [country, category, sortBy, filters, fetchPageOne]);

  // Debounce timer for rapid filter drawer clicks
  const debounceTimerRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const scheduleFetch = React.useCallback(
    (
      nextCategory: ExploreCategory,
      nextSort: DiscoverSortOption,
      nextFilters: DiscoverFilters,
      immediate: boolean = false
    ) => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      setIsFetching(true);
      if (immediate) {
        fetchPageOne(nextCategory, nextSort, nextFilters, country);
      } else {
        debounceTimerRef.current = window.setTimeout(() => {
          fetchPageOne(nextCategory, nextSort, nextFilters, country);
        }, 250);
      }
    },
    [country, fetchPageOne]
  );

  // Handlers
  const handleSelectCategory = (nextCategory: ExploreCategory) => {
    const nextSort = getDefaultSortForCategory(nextCategory);
    setCategory(nextCategory);
    setSortBy(nextSort);
    syncUrl({ category: nextCategory, sortBy: nextSort, viewMode, filters });

    if (
      nextCategory === "trending" &&
      nextSort === getDefaultSortForCategory("trending") &&
      !hasServerFilters(filters)
    ) {
      requestIdRef.current++;
      setItems(initialData.items);
      setPage(initialData.page);
      setTotalPages(initialData.totalPages);
      setTotalResults(initialData.totalResults);
      setIsFetching(false);
      return;
    }

    scheduleFetch(nextCategory, nextSort, filters, true);
  };

  const handleSelectSort = (nextSort: DiscoverSortOption) => {
    setSortBy(nextSort);
    syncUrl({ category, sortBy: nextSort, viewMode, filters });
    scheduleFetch(category, nextSort, filters, true);
  };

  const handleSelectViewMode = (nextView: ExploreViewMode) => {
    setViewMode(nextView);
    syncUrl({ category, sortBy, viewMode: nextView, filters });
  };

  const handleUpdateFilters = (patch: Partial<DiscoverFilters>) => {
    const nextFilters = { ...filters, ...patch };
    const serverChanged =
      hasServerFilters(nextFilters) !== hasServerFilters(filters) ||
      JSON.stringify({ ...filters, hideWatchlisted: false, hideWatched: false }) !==
        JSON.stringify({ ...nextFilters, hideWatchlisted: false, hideWatched: false });

    setFilters(nextFilters);
    syncUrl({ category, sortBy, viewMode, filters: nextFilters });

    if (serverChanged) {
      scheduleFetch(category, sortBy, nextFilters, false);
    }
  };

  const handleToggleGenre = (genreId: number) => {
    const exists = filters.genres.includes(genreId);
    const nextGenres = exists
      ? filters.genres.filter((id) => id !== genreId)
      : [...filters.genres, genreId];
    handleUpdateFilters({ genres: nextGenres });
  };

  const handleClearGenres = () => {
    if (filters.genres.length === 0) return;
    handleUpdateFilters({ genres: [] });
  };

  const handleResetAll = () => {
    const defaultSort = getDefaultSortForCategory(category);
    setSortBy(defaultSort);
    setFilters(DEFAULT_FILTERS);
    syncUrl({ category, sortBy: defaultSort, viewMode, filters: DEFAULT_FILTERS });

    if (category === "trending") {
      requestIdRef.current++;
      setItems(initialData.items);
      setPage(initialData.page);
      setTotalPages(initialData.totalPages);
      setTotalResults(initialData.totalResults);
      setIsFetching(false);
    } else {
      scheduleFetch(category, defaultSort, DEFAULT_FILTERS, true);
    }
  };

  // Load next page
  const hasMore = page < totalPages;

  const handleLoadMore = React.useCallback(async () => {
    if (isLoadingMore || isFetching || !hasMore) return;
    const reqId = requestIdRef.current;
    const nextPage = page + 1;
    setIsLoadingMore(true);

    try {
      const useDiscover =
        hasServerFilters(filters) || sortBy !== getDefaultSortForCategory(category);

      const res = useDiscover
        ? await discoverMediaAction(mediaType, {
            category,
            sortBy,
            page: nextPage,
            filters,
            watchRegion: country,
          })
        : await fetchExploreCategoryAction(mediaType, category, nextPage);

      if (reqId !== requestIdRef.current) return;

      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id));
        const unique = res.items.filter((i) => !seen.has(i.id));
        return [...prev, ...unique];
      });
      setPage(res.page);
      setTotalPages(res.totalPages);
      setTotalResults(res.totalResults);
    } catch (error) {
      console.error("Failed to load more explore items:", error);
    } finally {
      if (reqId === requestIdRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, isFetching, hasMore, page, filters, sortBy, category, mediaType, country]);

  // IntersectionObserver for smooth infinite scroll
  React.useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "650px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetching, handleLoadMore]);

  // Client-side personal library filtering
  const visibleItems = React.useMemo(() => {
    return items.filter((item) => {
      if (filters.hideWatchlisted && isSaved(item.id, mediaType)) {
        return false;
      }
      if (filters.hideWatched && watchedSet.has(item.id)) {
        return false;
      }
      return true;
    });
  }, [items, filters.hideWatchlisted, filters.hideWatched, isSaved, mediaType, watchedSet]);

  // Auto-fetch next page if client-side library filters hide every item on the current page
  const shouldAutoAdvance =
    !isFetching &&
    !isLoadingMore &&
    hasMore &&
    items.length > 0 &&
    visibleItems.length === 0 &&
    (filters.hideWatchlisted || filters.hideWatched);

  React.useEffect(() => {
    if (!shouldAutoAdvance) return;
    const timer = window.setTimeout(() => {
      handleLoadMore();
    }, 80);
    return () => window.clearTimeout(timer);
  }, [shouldAutoAdvance, handleLoadMore]);

  return (
    <>
      <ExploreCommandBar
        mediaType={mediaType}
        category={category}
        sortBy={sortBy}
        viewMode={viewMode}
        filters={filters}
        totalResults={totalResults}
        visibleCount={visibleItems.length}
        isFetching={isFetching}
        providers={providers}
        onSelectCategory={handleSelectCategory}
        onSelectSort={handleSelectSort}
        onSelectViewMode={handleSelectViewMode}
        onToggleGenre={handleToggleGenre}
        onClearGenres={handleClearGenres}
        onUpdateFilters={handleUpdateFilters}
        onResetAll={handleResetAll}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <ExploreFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mediaType={mediaType}
        filters={filters}
        providers={providers}
        isLoadingProviders={isLoadingProviders}
        totalResults={totalResults}
        visibleCount={visibleItems.length}
        isFetching={isFetching}
        onUpdateFilters={handleUpdateFilters}
        onToggleGenre={handleToggleGenre}
        onResetAll={handleResetAll}
      />

      <section
        aria-label={mediaType === "movie" ? "Movie catalog" : "TV series catalog"}
        className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8"
      >
        {isFetching || shouldAutoAdvance ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-white/[0.05] ring-1 ring-white/[0.06]" />
                  <div className="space-y-1.5 px-0.5">
                    <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.07]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5"
                >
                  <div className="aspect-[2/3] w-24 sm:w-28 shrink-0 animate-pulse rounded-xl bg-white/[0.06]" />
                  <div className="flex-1 space-y-2.5 py-1">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.08]" />
                    <div className="h-3.5 w-1/3 animate-pulse rounded bg-white/[0.05]" />
                    <div className="h-3 w-full animate-pulse rounded bg-white/[0.04]" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] py-20 px-4 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-white/12 bg-white/[0.05]">
              <SlidersHorizontal className="size-6 text-zinc-400" />
            </div>
            <h2 className="font-heading text-xl font-bold text-white">
              No {mediaType === "movie" ? "Films" : "Series"} Match These Filters
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              Try loosening your rating threshold, clearing a genre requirement, or switching streaming regions.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={handleResetAll}
                className="rounded-full bg-white px-5 text-xs font-semibold text-black hover:bg-zinc-200 cursor-pointer"
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reset All Filters
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDrawerOpen(true)}
                className="rounded-full border-white/15 bg-white/[0.04] px-5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
              >
                Adjust Filters
              </Button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-5">
                {visibleItems.map((item) => (
                  <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {visibleItems.map((item) => (
                  <ExploreEditorialCard
                    key={`${item.media_type}-${item.id}`}
                    item={item}
                    isWatched={watchedSet.has(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel & Inline Loading Cards */}
            <div ref={loadMoreRef} className="mt-8">
              {isLoadingMore && (
                <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2.5">
                      <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-white/[0.05] ring-1 ring-white/[0.06]" />
                      <div className="space-y-1.5 px-0.5">
                        <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.07]" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasMore && !isLoadingMore && (
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMore}
                    className="rounded-full border-white/15 bg-white/[0.04] px-6 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-white/12 hover:text-white cursor-pointer"
                  >
                    <Loader2 className="mr-2 hidden size-3.5 animate-spin" />
                    Load More {mediaType === "movie" ? "Films" : "Series"}
                  </Button>
                </div>
              )}

              {!hasMore && visibleItems.length > 0 && (
                <div className="mt-10 flex items-center justify-center gap-3 text-xs font-medium text-zinc-500">
                  <span className="h-px w-12 bg-white/10" />
                  <span>End of results</span>
                  <span className="h-px w-12 bg-white/10" />
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Floating Back to Top Pill */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="glass-panel fixed bottom-6 right-6 z-40 flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white transition-all hover:scale-105 hover:bg-white/15 active:scale-95 cursor-pointer"
        >
          <ArrowUp className="size-3.5" />
          <span>Top</span>
        </button>
      )}
    </>
  );
}
