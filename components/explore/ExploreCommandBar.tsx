"use client";

import * as React from "react";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  LayoutGrid,
  LayoutList,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { WatchProvider } from "@/lib/tmdb";
import {
  DiscoverFilters,
  DiscoverSortOption,
  ExploreCategory,
  ExploreMediaType,
  ExploreViewMode,
  LANGUAGES,
  MONETIZATION_OPTIONS,
  TV_NETWORKS,
  TV_STATUSES,
  TV_TYPES,
  countActiveFilters,
  getCategoriesForMediaType,
  getDefaultSortForCategory,
  getGenreMap,
  getGenresForMediaType,
  getRuntimePresets,
  getSortOptionsForMediaType,
} from "@/lib/explore-config";
import { cn } from "@/lib/utils";

interface ExploreCommandBarProps {
  mediaType: ExploreMediaType;
  category: ExploreCategory;
  sortBy: DiscoverSortOption;
  viewMode: ExploreViewMode;
  filters: DiscoverFilters;
  totalResults: number;
  visibleCount: number;
  isFetching: boolean;
  providers: WatchProvider[];
  onSelectCategory: (category: ExploreCategory) => void;
  onSelectSort: (sort: DiscoverSortOption) => void;
  onSelectViewMode: (view: ExploreViewMode) => void;
  onToggleGenre: (genreId: number) => void;
  onClearGenres: () => void;
  onUpdateFilters: (patch: Partial<DiscoverFilters>) => void;
  onResetAll: () => void;
  onOpenDrawer: () => void;
}

interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ExploreCommandBar({
  mediaType,
  category,
  sortBy,
  viewMode,
  filters,
  totalResults,
  visibleCount,
  isFetching,
  providers,
  onSelectCategory,
  onSelectSort,
  onSelectViewMode,
  onToggleGenre,
  onClearGenres,
  onUpdateFilters,
  onResetAll,
  onOpenDrawer,
}: ExploreCommandBarProps) {
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const categories = getCategoriesForMediaType(mediaType);
  const sortOptions = getSortOptionsForMediaType(mediaType);
  const genres = getGenresForMediaType(mediaType);
  const genreMap = getGenreMap(mediaType);
  const activeSortLabel =
    sortOptions.find((s) => s.value === sortBy)?.label || "Most Popular";
  const activeFilterCount = countActiveFilters(filters);

  const providerNameMap = React.useMemo(
    () => Object.fromEntries(providers.map((p) => [p.provider_id, p.provider_name])),
    [providers]
  );

  // Build removable chips for every active filter & custom sort
  const activeChips: ActiveChip[] = [];

  if (sortBy !== getDefaultSortForCategory(category)) {
    activeChips.push({
      key: "sort",
      label: `Sort: ${activeSortLabel}`,
      onRemove: () => onSelectSort(getDefaultSortForCategory(category)),
    });
  }

  filters.providers.forEach((pid) => {
    activeChips.push({
      key: `provider-${pid}`,
      label: `Streaming: ${providerNameMap[pid] || `#${pid}`}`,
      onRemove: () =>
        onUpdateFilters({
          providers: filters.providers.filter((id) => id !== pid),
        }),
    });
  });

  if (filters.monetization) {
    const monLabel =
      MONETIZATION_OPTIONS.find((m) => m.value === filters.monetization)?.label ||
      filters.monetization;
    activeChips.push({
      key: "monetization",
      label: `Access: ${monLabel}`,
      onRemove: () => onUpdateFilters({ monetization: "" }),
    });
  }

  if (filters.genres.length > 1 && filters.genreMode === "and") {
    activeChips.push({
      key: "genreMode",
      label: "Genres: Match All",
      onRemove: () => onUpdateFilters({ genreMode: "or" }),
    });
  }

  filters.genres.forEach((gid) => {
    activeChips.push({
      key: `genre-${gid}`,
      label: genreMap[gid] || `Genre ${gid}`,
      onRemove: () => onToggleGenre(gid),
    });
  });

  if (filters.decade) {
    activeChips.push({
      key: "decade",
      label: `Era: ${filters.decade === "classic" ? "Pre-1970" : filters.decade}`,
      onRemove: () => onUpdateFilters({ decade: "" }),
    });
  } else if (filters.yearFrom || filters.yearTo) {
    const spanLabel =
      filters.yearFrom && filters.yearTo
        ? `${filters.yearFrom}–${filters.yearTo}`
        : filters.yearFrom
          ? `From ${filters.yearFrom}`
          : `Until ${filters.yearTo}`;
    activeChips.push({
      key: "years",
      label: `Years: ${spanLabel}`,
      onRemove: () => onUpdateFilters({ yearFrom: "", yearTo: "" }),
    });
  }

  if (filters.minRating > 0) {
    activeChips.push({
      key: "rating",
      label: `Rating: ${filters.minRating.toFixed(1)}+`,
      onRemove: () => onUpdateFilters({ minRating: 0 }),
    });
  }

  if (filters.minVotes > 0) {
    activeChips.push({
      key: "votes",
      label: `Votes: ${filters.minVotes >= 1000 ? `${filters.minVotes / 1000}K+` : `${filters.minVotes}+`}`,
      onRemove: () => onUpdateFilters({ minVotes: 0 }),
    });
  }

  if (filters.runtimePreset) {
    const rtLabel =
      getRuntimePresets(mediaType).find((r) => r.value === filters.runtimePreset)
        ?.label || filters.runtimePreset;
    activeChips.push({
      key: "runtime",
      label: `Runtime: ${rtLabel}`,
      onRemove: () => onUpdateFilters({ runtimePreset: "" }),
    });
  }

  if (filters.language) {
    const langLabel =
      LANGUAGES.find((l) => l.code === filters.language)?.label || filters.language;
    activeChips.push({
      key: "language",
      label: `Language: ${langLabel}`,
      onRemove: () => onUpdateFilters({ language: "" }),
    });
  }

  if (mediaType === "movie" && filters.certification) {
    activeChips.push({
      key: "cert",
      label: `Rated: ${filters.certification}`,
      onRemove: () => onUpdateFilters({ certification: "" }),
    });
  }

  if (mediaType === "tv") {
    if (filters.tvStatus) {
      const stLabel =
        TV_STATUSES.find((s) => s.value === filters.tvStatus)?.label ||
        filters.tvStatus;
      activeChips.push({
        key: "tvStatus",
        label: `Status: ${stLabel}`,
        onRemove: () => onUpdateFilters({ tvStatus: "" }),
      });
    }
    if (filters.tvType) {
      const tyLabel =
        TV_TYPES.find((t) => t.value === filters.tvType)?.label || filters.tvType;
      activeChips.push({
        key: "tvType",
        label: `Format: ${tyLabel}`,
        onRemove: () => onUpdateFilters({ tvType: "" }),
      });
    }
    filters.networks.forEach((nid) => {
      const netName = TV_NETWORKS.find((n) => n.id === nid)?.name || `#${nid}`;
      activeChips.push({
        key: `network-${nid}`,
        label: `Network: ${netName}`,
        onRemove: () =>
          onUpdateFilters({
            networks: filters.networks.filter((id) => id !== nid),
          }),
      });
    });
  }

  if (filters.hideWatchlisted) {
    activeChips.push({
      key: "hideWatchlisted",
      label: "Hiding Watchlist",
      onRemove: () => onUpdateFilters({ hideWatchlisted: false }),
    });
  }

  if (filters.hideWatched) {
    activeChips.push({
      key: "hideWatched",
      label: "Hiding Watched",
      onRemove: () => onUpdateFilters({ hideWatched: false }),
    });
  }

  const displayNoun = mediaType === "movie" ? "films" : "series";
  const countText = isFetching
    ? "Updating..."
    : totalResults > 0
      ? `${totalResults.toLocaleString()} ${displayNoun}`
      : `${visibleCount.toLocaleString()} ${displayNoun}`;

  return (
    <div className="sticky top-0 z-30 border-y border-white/[0.06] bg-[#070708]/88 pt-[68px] md:pt-[74px] backdrop-blur-2xl">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Primary Command Row: Categories + Controls */}
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Pills */}
          <div
            role="tablist"
            aria-label="Browse categories"
            className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5 lg:pb-0"
          >
            {categories.map((cat) => {
              const active = category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onSelectCategory(cat.value)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    active
                      ? "bg-white text-black font-semibold shadow-[0_4px_18px_rgba(255,255,255,0.2)]"
                      : "border border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Count, Sort, View Switcher, Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
            <span className="text-[11px] font-medium text-zinc-500 tabular-nums sm:mr-1">
              {countText}
            </span>

            <div className="flex items-center gap-2">
              {/* Sort Popover */}
              <div className="relative" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((prev) => !prev)}
                  aria-haspopup="listbox"
                  aria-expanded={sortOpen}
                  className={cn(
                    "flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    sortOpen
                      ? "border-white/30 bg-white/12 text-white"
                      : "border-white/12 bg-white/[0.04] text-zinc-200 hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
                  )}
                >
                  <ArrowUpDown className="size-3.5 text-zinc-400" />
                  <span className="hidden sm:inline text-zinc-400">Sort:</span>
                  <span>{activeSortLabel}</span>
                  <ChevronDown
                    className={cn(
                      "size-3 text-zinc-400 transition-transform duration-200",
                      sortOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      role="listbox"
                      aria-label="Sort results by"
                      className="glass-panel absolute right-0 top-full mt-2 z-50 flex w-48 flex-col gap-0.5 rounded-2xl p-1.5"
                    >
                      {sortOptions.map((opt) => {
                        const selected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            onClick={() => {
                              onSelectSort(opt.value);
                              setSortOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer",
                              selected
                                ? "bg-white/14 text-white"
                                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                            )}
                          >
                            <span>{opt.label}</span>
                            {selected && <Check className="size-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Mode Toggle */}
              <div
                role="group"
                aria-label="View layout"
                className="flex h-9 items-center rounded-full border border-white/12 bg-white/[0.04] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => onSelectViewMode("grid")}
                  aria-label="Poster grid view"
                  aria-pressed={viewMode === "grid"}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-all cursor-pointer",
                    viewMode === "grid"
                      ? "bg-white text-black shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectViewMode("editorial")}
                  aria-label="Detailed editorial view"
                  aria-pressed={viewMode === "editorial"}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-all cursor-pointer",
                    viewMode === "editorial"
                      ? "bg-white text-black shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  <LayoutList className="size-3.5" />
                </button>
              </div>

              {/* Filter Studio Trigger */}
              <button
                type="button"
                onClick={onOpenDrawer}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  activeFilterCount > 0
                    ? "border-white bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
                    : "border-white/15 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/[0.12]"
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span
                    className={cn(
                      "inline-flex min-w-4.5 items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums",
                      activeFilterCount > 0
                        ? "bg-black/15 text-black"
                        : "bg-white/15 text-white"
                    )}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Row: Inline Quick-Genre Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-white/[0.05] py-2.5 hide-scrollbar">
          <button
            type="button"
            onClick={onClearGenres}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
              filters.genres.length === 0
                ? "bg-white/15 text-white ring-1 ring-white/20"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            )}
          >
            All Genres
          </button>
          {genres.map((genre) => {
            const selected = filters.genres.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => onToggleGenre(genre.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all cursor-pointer",
                  selected
                    ? "border-white bg-white text-black font-semibold"
                    : "border-white/[0.07] bg-white/[0.025] text-zinc-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                )}
              >
                {genre.name}
              </button>
            );
          })}
        </div>

        {/* Conditional Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.05] py-2.5">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/14 hover:text-white cursor-pointer"
              >
                <span>{chip.label}</span>
                <X className="size-3 text-zinc-400 transition-colors group-hover:text-white" />
              </button>
            ))}

            <button
              type="button"
              onClick={onResetAll}
              className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer"
            >
              <RotateCcw className="size-3" />
              Reset all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
