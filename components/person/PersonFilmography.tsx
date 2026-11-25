"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  EyeOff,
  Film,
  LayoutGrid,
  LayoutList,
  RotateCcw,
  Search,
  Star,
  Tv,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { getImageUrl, TMDBItem } from "@/lib/tmdb";
import { MOVIE_GENRES, TV_GENRES } from "@/lib/explore-config";
import {
  NormalizedPersonCredit,
  PersonDepartmentTab,
} from "@/lib/person-credits";
import { MediaCard } from "@/components/MediaCard";
import { MiniWatchlistButton } from "@/components/media/MiniWatchlistButton";
import { formatMediaRating } from "@/lib/media-display";
import { cn } from "@/lib/utils";

type SortMode = "newest" | "oldest" | "rating" | "popular";
type MediaFilter = "all" | "movie" | "tv";
type ViewMode = "timeline" | "grid";

const GENRE_NAME_MAP: Record<number, string> = {
  ...Object.fromEntries(MOVIE_GENRES.map((g) => [g.id, g.name])),
  ...Object.fromEntries(TV_GENRES.map((g) => [g.id, g.name])),
};

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

interface PersonFilmographyProps {
  credits: NormalizedPersonCredit[];
  departmentTabs: PersonDepartmentTab[];
  defaultHideSelf: boolean;
  watchedMap: Map<string, number | null>;
  selectedDecade: string | null;
  selectedGenreId: number | null;
  watchStatus: "all" | "unwatched" | "watched";
  onClearDecade: () => void;
  onClearGenre: () => void;
  onChangeWatchStatus: (status: "all" | "unwatched" | "watched") => void;
}

export function PersonFilmography({
  credits,
  departmentTabs,
  defaultHideSelf,
  watchedMap,
  selectedDecade,
  selectedGenreId,
  watchStatus,
  onClearDecade,
  onClearGenre,
  onChangeWatchStatus,
}: PersonFilmographyProps) {
  const { isSignedIn } = useAuth();
  const [department, setDepartment] = React.useState<string>("all");
  const [mediaFilter, setMediaFilter] = React.useState<MediaFilter>("all");
  const [hideSelf, setHideSelf] = React.useState<boolean>(defaultHideSelf);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [sortMode, setSortMode] = React.useState<SortMode>("newest");
  const [viewMode, setViewMode] = React.useState<ViewMode>("timeline");
  const [sortOpen, setSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const hiddenSelfCount = React.useMemo(
    () => credits.filter((c) => c.isSelfAppearance).length,
    [credits]
  );

  // Dynamically compute department tabs respecting current hideSelf toggle
  const dynamicDepartments = React.useMemo(() => {
    if (hideSelf === defaultHideSelf) return departmentTabs;
    const pool = hideSelf
      ? credits.filter((c) => !c.isSelfAppearance)
      : credits;
    const counts = new Map<string, number>();
    for (const c of pool) {
      for (const d of c.departments) {
        counts.set(d, (counts.get(d) || 0) + 1);
      }
    }
    const ordered = departmentTabs
      .filter((t) => t.id !== "all")
      .map((t) => ({ ...t, count: counts.get(t.id) || 0 }))
      .filter((t) => t.count > 0);

    for (const [dept, count] of counts.entries()) {
      if (!ordered.some((o) => o.id === dept)) {
        ordered.push({ id: dept, label: dept, count });
      }
    }
    return [{ id: "all", label: "All", count: pool.length }, ...ordered];
  }, [hideSelf, defaultHideSelf, departmentTabs, credits]);

  const filteredCredits = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = credits.filter((credit) => {
      if (hideSelf && credit.isSelfAppearance) return false;
      if (department !== "all" && !credit.departments.includes(department)) {
        return false;
      }
      if (mediaFilter !== "all" && credit.mediaType !== mediaFilter) {
        return false;
      }
      if (selectedDecade && credit.decade !== selectedDecade) {
        return false;
      }
      if (selectedGenreId && !credit.genreIds.includes(selectedGenreId)) {
        return false;
      }
      if (isSignedIn && watchStatus !== "all") {
        const isWatched = watchedMap.has(credit.key);
        if (watchStatus === "watched" && !isWatched) return false;
        if (watchStatus === "unwatched" && (isWatched || credit.isUpcoming)) {
          return false;
        }
      }
      if (q) {
        const matchesTitle = credit.title.toLowerCase().includes(q);
        const matchesRole = credit.primaryRoleLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesRole) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "newest") {
        if (a.isUpcoming !== b.isUpcoming) return a.isUpcoming ? -1 : 1;
        return (b.releaseDate || "").localeCompare(a.releaseDate || "");
      }
      if (sortMode === "oldest") {
        if (a.isUpcoming !== b.isUpcoming) return a.isUpcoming ? 1 : -1;
        return (a.releaseDate || "9999").localeCompare(b.releaseDate || "9999");
      }
      if (sortMode === "rating") {
        if (Math.abs(b.voteAverage - a.voteAverage) > 0.05) {
          return b.voteAverage - a.voteAverage;
        }
        return b.voteCount - a.voteCount;
      }
      return b.knownForScore - a.knownForScore;
    });
  }, [
    credits,
    hideSelf,
    department,
    mediaFilter,
    selectedDecade,
    selectedGenreId,
    isSignedIn,
    watchStatus,
    watchedMap,
    searchQuery,
    sortMode,
  ]);

  // Group chronologically by decade when sortMode is newest/oldest
  const isChronological = sortMode === "newest" || sortMode === "oldest";
  const decadeGroups = React.useMemo(() => {
    if (!isChronological) return [];
    const groups: Array<{ decade: string; items: NormalizedPersonCredit[] }> = [];
    const indexMap = new Map<string, number>();

    for (const item of filteredCredits) {
      let idx = indexMap.get(item.decade);
      if (idx === undefined) {
        idx = groups.length;
        indexMap.set(item.decade, idx);
        groups.push({ decade: item.decade, items: [] });
      }
      groups[idx].items.push(item);
    }
    return groups;
  }, [filteredCredits, isChronological]);

  const hasExternalFilters =
    Boolean(selectedDecade) ||
    Boolean(selectedGenreId) ||
    watchStatus !== "all" ||
    searchQuery.trim().length > 0 ||
    department !== "all" ||
    mediaFilter !== "all";

  const handleResetAll = () => {
    setDepartment("all");
    setMediaFilter("all");
    setSearchQuery("");
    onClearDecade();
    onClearGenre();
    onChangeWatchStatus("all");
  };

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortMode)?.label || "Newest First";

  const renderTimelineRow = (credit: NormalizedPersonCredit) => {
    const posterUrl = getImageUrl(credit.posterPath, "w342");
    const href = `/${credit.mediaType}/${credit.id}`;
    const isWatched = isSignedIn && watchedMap.has(credit.key);
    const userRating = watchedMap.get(credit.key);

    const mediaItem: TMDBItem = {
      id: credit.id,
      title: credit.mediaType === "movie" ? credit.title : undefined,
      name: credit.mediaType === "tv" ? credit.title : undefined,
      overview: credit.overview,
      poster_path: credit.posterPath || "",
      backdrop_path: credit.backdropPath || "",
      release_date: credit.mediaType === "movie" ? credit.releaseDate : undefined,
      first_air_date: credit.mediaType === "tv" ? credit.releaseDate : undefined,
      vote_average: credit.voteAverage,
      media_type: credit.mediaType,
      genre_ids: credit.genreIds,
    };

    const roleText = credit.primaryRoleLabel
      ? credit.primaryRoleLabel
      : credit.departments.join(" · ");

    return (
      <Link
        key={credit.key}
        href={href}
        prefetch={false}
        className="group flex items-center justify-between gap-3 sm:gap-4 px-3.5 py-3 sm:px-5 sm:py-3.5 transition-colors hover:bg-white/[0.04]"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {/* Mini 2:3 Poster */}
          <div className="relative aspect-[2/3] w-11 sm:w-13 shrink-0 overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/10">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={credit.title}
                fill
                sizes="56px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-600">
                {credit.mediaType === "movie" ? (
                  <Film className="size-4" />
                ) : (
                  <Tv className="size-4" />
                )}
              </div>
            )}
          </div>

          {/* Year + Title + Roles */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-zinc-400 tabular-nums">
                {credit.year ?? "TBA"}
              </span>
              <span className="truncate font-heading text-sm sm:text-[15px] font-semibold text-white transition-colors group-hover:text-zinc-100">
                {credit.title}
              </span>
              {credit.isUpcoming && (
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                  Upcoming
                </span>
              )}
              {isWatched && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Seen{userRating ? ` · ★${userRating}` : ""}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400">
              {roleText && <span className="truncate">{roleText}</span>}
              {credit.totalEpisodes > 0 && (
                <span className="text-[11px] text-zinc-500 tabular-nums">
                  · {credit.totalEpisodes}{" "}
                  {credit.totalEpisodes === 1 ? "episode" : "episodes"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Badges & Watchlist Action */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {credit.voteAverage > 0 && (
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-xs font-semibold text-zinc-200 tabular-nums">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {formatMediaRating(credit.voteAverage)}
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
            {credit.mediaType === "movie" ? (
              <>
                <Film className="size-3 text-zinc-400" />
                Film
              </>
            ) : (
              <>
                <Tv className="size-3 text-zinc-400" />
                Series
              </>
            )}
          </span>

          <MiniWatchlistButton
            item={mediaItem}
            className="static opacity-100 md:opacity-100 shrink-0"
          />
        </div>
      </Link>
    );
  };

  return (
    <section
      id="filmography"
      aria-labelledby="filmography-heading"
      className="container mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8 scroll-mt-24"
    >
      {/* Header + View & Sort Controls */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Complete Credits
          </p>
          <h2
            id="filmography-heading"
            className="mt-0.5 font-heading text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            Filmography{" "}
            <span className="ml-1 text-sm font-medium text-zinc-500 tabular-nums">
              ({filteredCredits.length})
            </span>
          </h2>
        </div>

        {/* Search, Sort & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] sm:w-56 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, role, or job..."
              aria-label="Search filmography"
              className="h-9 w-full rounded-full border border-white/12 bg-white/[0.04] pl-8.5 pr-8 text-xs text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-white/30 focus:bg-white/[0.07]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className="flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3.5 text-xs font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white cursor-pointer"
            >
              <ArrowUpDown className="size-3.5 text-zinc-400" />
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
                  className="glass-panel absolute right-0 top-full z-40 mt-2 flex w-44 flex-col gap-0.5 rounded-2xl p-1.5"
                >
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSortMode(opt.value);
                          setSortOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer",
                          active
                            ? "bg-white/14 text-white"
                            : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                        )}
                      >
                        <span>{opt.label}</span>
                        {active && <Check className="size-3.5 text-white" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View Mode Switcher */}
          <div
            role="group"
            aria-label="Filmography view mode"
            className="flex h-9 items-center rounded-full border border-white/12 bg-white/[0.04] p-0.5"
          >
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              aria-label="Timeline view"
              aria-pressed={viewMode === "timeline"}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-all cursor-pointer",
                viewMode === "timeline"
                  ? "bg-white text-black shadow-xs"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <LayoutList className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
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
          </div>
        </div>
      </div>

      {/* Department Tabs & Filter Pills */}
      <div className="mb-5 space-y-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4">
        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
          {dynamicDepartments.map((tab) => {
            const active = department === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDepartment(tab.id)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer tabular-nums",
                  active
                    ? "bg-white text-black font-semibold shadow-xs"
                    : "border border-white/[0.07] bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                )}
              >
                {tab.label}{" "}
                <span className={active ? "text-black/65" : "text-zinc-500"}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Media Type, Watch Status & Hide Self Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { value: "all", label: "All Formats" },
                { value: "movie", label: "Films" },
                { value: "tv", label: "Series" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMediaFilter(opt.value)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                  mediaFilter === opt.value
                    ? "border-white/30 bg-white/14 text-white"
                    : "border-white/[0.06] bg-transparent text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                )}
              >
                {opt.label}
              </button>
            ))}

            {isSignedIn && (
              <>
                <span className="mx-1 h-3.5 w-px bg-white/10" />
                {(
                  [
                    { value: "unwatched", label: "Unwatched" },
                    { value: "watched", label: "Watched" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onChangeWatchStatus(
                        watchStatus === opt.value ? "all" : opt.value
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                      watchStatus === opt.value
                        ? "border-white bg-white text-black font-semibold"
                        : "border-white/[0.06] bg-transparent text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </>
            )}
          </div>

          {hiddenSelfCount > 0 && (
            <button
              type="button"
              onClick={() => setHideSelf((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer",
                hideSelf
                  ? "border-white/25 bg-white/12 text-white"
                  : "border-white/[0.08] bg-transparent text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              )}
            >
              <EyeOff className="size-3" />
              <span>
                {hideSelf
                  ? `Hiding ${hiddenSelfCount} Self / Talk Show`
                  : `Showing ${hiddenSelfCount} Self / Talk Show`}
              </span>
            </button>
          )}
        </div>

        {/* Active External Chips (from Career DNA or Search) */}
        {(selectedDecade || selectedGenreId || watchStatus !== "all") && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.05] pt-2.5">
            {selectedDecade && (
              <button
                type="button"
                onClick={onClearDecade}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/18 cursor-pointer"
              >
                <span>Decade: {selectedDecade}</span>
                <X className="size-3" />
              </button>
            )}
            {selectedGenreId && (
              <button
                type="button"
                onClick={onClearGenre}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/18 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/18 cursor-pointer"
              >
                <span>
                  Genre: {GENRE_NAME_MAP[selectedGenreId] || selectedGenreId}
                </span>
                <X className="size-3" />
              </button>
            )}
            {hasExternalFilters && (
              <button
                type="button"
                onClick={handleResetAll}
                className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="size-3" />
                Reset all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Area */}
      {filteredCredits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 px-4 text-center">
          <p className="text-sm font-semibold text-white">
            No credits match these filters
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Try clearing your search, switching departments, or including Self appearances.
          </p>
          {hasExternalFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-zinc-200 cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === "timeline" ? (
        isChronological ? (
          <div className="space-y-6">
            {decadeGroups.map((group) => (
              <div
                key={group.decade}
                className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 sm:px-5">
                  <span className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-zinc-200">
                    {group.decade}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 tabular-nums">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "credit" : "credits"}
                  </span>
                </div>
                <div className="divide-y divide-white/[0.05]">
                  {group.items.map(renderTimelineRow)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            {filteredCredits.map(renderTimelineRow)}
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-5">
          {filteredCredits.map((credit) => {
            const mediaItem: TMDBItem = {
              id: credit.id,
              title: credit.mediaType === "movie" ? credit.title : undefined,
              name: credit.mediaType === "tv" ? credit.title : undefined,
              overview: credit.overview,
              poster_path: credit.posterPath || "",
              backdrop_path: credit.backdropPath || "",
              release_date:
                credit.mediaType === "movie" ? credit.releaseDate : undefined,
              first_air_date:
                credit.mediaType === "tv" ? credit.releaseDate : undefined,
              vote_average: credit.voteAverage,
              media_type: credit.mediaType,
              genre_ids: credit.genreIds,
            };

            return (
              <div key={credit.key} className="space-y-1">
                <MediaCard item={mediaItem} />
                {credit.primaryRoleLabel && (
                  <p
                    title={credit.primaryRoleLabel}
                    className="truncate px-0.5 text-[11px] font-medium text-zinc-400"
                  >
                    {credit.primaryRoleLabel}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
