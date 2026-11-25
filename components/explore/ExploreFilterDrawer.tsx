"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, RotateCcw, Star, Tv, X } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { WatchProvider } from "@/lib/tmdb";
import { COUNTRIES, useCountry } from "@/components/providers/CountryProvider";
import {
  DECADES,
  DiscoverFilters,
  ExploreMediaType,
  LANGUAGES,
  MONETIZATION_OPTIONS,
  MOVIE_CERTIFICATIONS,
  RATING_OPTIONS,
  TV_NETWORKS,
  TV_STATUSES,
  TV_TYPES,
  VOTE_COUNT_OPTIONS,
  YEAR_OPTIONS,
  countActiveFilters,
  getGenresForMediaType,
  getRuntimePresets,
} from "@/lib/explore-config";
import { cn } from "@/lib/utils";

interface ExploreFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: ExploreMediaType;
  filters: DiscoverFilters;
  providers: WatchProvider[];
  isLoadingProviders: boolean;
  totalResults: number;
  visibleCount: number;
  isFetching: boolean;
  onUpdateFilters: (patch: Partial<DiscoverFilters>) => void;
  onToggleGenre: (genreId: number) => void;
  onResetAll: () => void;
}

const emptySubscribe = () => () => {};

function SectionHeader({
  title,
  meta,
  rightSlot,
}: {
  title: string;
  meta?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
          {title}
        </h3>
        {meta && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            {meta}
          </span>
        )}
      </div>
      {rightSlot}
    </div>
  );
}

export function ExploreFilterDrawer({
  isOpen,
  onClose,
  mediaType,
  filters,
  providers,
  isLoadingProviders,
  totalResults,
  visibleCount,
  isFetching,
  onUpdateFilters,
  onToggleGenre,
  onResetAll,
}: ExploreFilterDrawerProps) {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [showAllProviders, setShowAllProviders] = React.useState(false);
  const { country } = useCountry();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const countryInfo = COUNTRIES.find((c) => c.code === country);
  const genres = getGenresForMediaType(mediaType);
  const runtimePresets = getRuntimePresets(mediaType);
  const activeCount = countActiveFilters(filters);
  const displayedProviders = showAllProviders ? providers : providers.slice(0, 12);

  const toggleProvider = (providerId: number) => {
    const exists = filters.providers.includes(providerId);
    onUpdateFilters({
      providers: exists
        ? filters.providers.filter((id) => id !== providerId)
        : [...filters.providers, providerId],
    });
  };

  const toggleNetwork = (networkId: number) => {
    const exists = filters.networks.includes(networkId);
    onUpdateFilters({
      networks: exists
        ? filters.networks.filter((id) => id !== networkId)
        : [...filters.networks, networkId],
    });
  };

  const handleLibraryToggle = (key: "hideWatchlisted" | "hideWatched") => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    onUpdateFilters({ [key]: !filters[key] });
  };

  const displayNoun = mediaType === "movie" ? "Films" : "Series";
  const resultSummaryCount = totalResults > 0 ? totalResults : visibleCount;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-end sm:items-stretch"
          role="dialog"
          aria-modal="true"
          aria-label={`Filter ${displayNoun}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Slide-over Desktop Sheet / Mobile Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 24, y: 12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/12 bg-[#0c0c0f]/95 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:m-3 sm:max-h-none sm:w-[450px] sm:rounded-3xl"
          >
            {/* Sticky Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-bold tracking-tight text-white">
                    Filter {displayNoun}
                  </h2>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black tabular-nums">
                      {activeCount}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Combine streaming, genres, era, and quality thresholds
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filter drawer"
                className="flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-zinc-300 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6 hide-scrollbar">
              {/* 1. Where to Watch */}
              <section>
                <SectionHeader
                  title="Where to Watch"
                  meta={
                    countryInfo ? `${countryInfo.flag} ${countryInfo.code}` : country
                  }
                />

                {/* Monetization Segmented Bar */}
                <div className="mb-3 grid grid-cols-4 gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
                  {MONETIZATION_OPTIONS.map((opt) => {
                    const active = filters.monetization === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => onUpdateFilters({ monetization: opt.value })}
                        className={cn(
                          "rounded-lg py-1.5 text-[11px] font-medium transition-all cursor-pointer",
                          active
                            ? "bg-white text-black font-semibold shadow-xs"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Regional Streaming Provider Grid */}
                {isLoadingProviders ? (
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square animate-pulse rounded-xl bg-white/[0.06]"
                      />
                    ))}
                  </div>
                ) : providers.length > 0 ? (
                  <>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                      {displayedProviders.map((provider) => {
                        const selected = filters.providers.includes(provider.provider_id);
                        return (
                          <button
                            key={provider.provider_id}
                            type="button"
                            title={provider.provider_name}
                            aria-label={provider.provider_name}
                            aria-pressed={selected}
                            onClick={() => toggleProvider(provider.provider_id)}
                            className={cn(
                              "group relative flex flex-col items-center gap-1 rounded-xl p-1 transition-all cursor-pointer",
                              selected
                                ? "bg-white/14 ring-2 ring-white"
                                : "bg-white/[0.03] ring-1 ring-white/[0.07] hover:bg-white/[0.08] hover:ring-white/25"
                            )}
                          >
                            <div className="relative size-10 overflow-hidden rounded-lg bg-zinc-900">
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                alt={provider.provider_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="w-full truncate text-center text-[9px] font-medium text-zinc-400 group-hover:text-zinc-200">
                              {provider.provider_name}
                            </span>
                            {selected && (
                              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white text-black shadow">
                                <Check className="size-2.5 stroke-[3]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {providers.length > 12 && (
                      <button
                        type="button"
                        onClick={() => setShowAllProviders((prev) => !prev)}
                        className="mt-2.5 text-[11px] font-medium text-zinc-400 underline-offset-4 hover:text-white hover:underline cursor-pointer"
                      >
                        {showAllProviders
                          ? "Show fewer services"
                          : `Show all ${providers.length} services in ${country}`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-500">
                    No streaming provider metadata found for {country}.
                  </p>
                )}
              </section>

              <hr className="border-white/[0.06]" />

              {/* 2. Genres + Match Mode */}
              <section>
                <SectionHeader
                  title="Genres"
                  meta={
                    filters.genres.length > 0
                      ? `${filters.genres.length} selected`
                      : undefined
                  }
                  rightSlot={
                    <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03] p-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => onUpdateFilters({ genreMode: "or" })}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
                          filters.genreMode === "or"
                            ? "bg-white text-black font-semibold"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        Match Any
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateFilters({ genreMode: "and" })}
                        className={cn(
                          "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
                          filters.genreMode === "and"
                            ? "bg-white text-black font-semibold"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        Match All
                      </button>
                    </div>
                  }
                />

                <div className="flex flex-wrap gap-1.5">
                  {genres.map((genre) => {
                    const selected = filters.genres.includes(genre.id);
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => onToggleGenre(genre.id)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          selected
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                        )}
                      >
                        {genre.name}
                      </button>
                    );
                  })}
                </div>
              </section>

              <hr className="border-white/[0.06]" />

              {/* 3. Release Era & Year Span */}
              <section>
                <SectionHeader title="Release Era" />
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {DECADES.map((dec) => {
                    const selected = filters.decade === dec.value;
                    return (
                      <button
                        key={dec.value}
                        type="button"
                        onClick={() =>
                          onUpdateFilters({
                            decade: selected ? "" : dec.value,
                            yearFrom: "",
                            yearTo: "",
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          selected
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                        )}
                      >
                        {dec.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      From Year
                    </span>
                    <select
                      value={filters.yearFrom}
                      onChange={(e) =>
                        onUpdateFilters({
                          yearFrom: e.target.value,
                          decade: "",
                        })
                      }
                      className="h-9 rounded-xl border border-white/12 bg-white/[0.04] px-3 text-xs font-medium text-white outline-none transition-colors hover:border-white/25 focus:border-white/40"
                    >
                      <option value="" className="bg-zinc-950 text-zinc-300">
                        Any Year
                      </option>
                      {YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr} className="bg-zinc-950 text-white">
                          {yr}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      To Year
                    </span>
                    <select
                      value={filters.yearTo}
                      onChange={(e) =>
                        onUpdateFilters({
                          yearTo: e.target.value,
                          decade: "",
                        })
                      }
                      className="h-9 rounded-xl border border-white/12 bg-white/[0.04] px-3 text-xs font-medium text-white outline-none transition-colors hover:border-white/25 focus:border-white/40"
                    >
                      <option value="" className="bg-zinc-950 text-zinc-300">
                        Present
                      </option>
                      {YEAR_OPTIONS.map((yr) => (
                        <option key={yr} value={yr} className="bg-zinc-950 text-white">
                          {yr}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <hr className="border-white/[0.06]" />

              {/* 4. Rating & Vote Threshold */}
              <section className="space-y-4">
                <div>
                  <SectionHeader title="Minimum Rating" />
                  <div className="flex flex-wrap gap-1.5">
                    {RATING_OPTIONS.map((rating) => {
                      const selected = filters.minRating === rating;
                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => onUpdateFilters({ minRating: rating })}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer tabular-nums",
                            selected
                              ? "border-white bg-white text-black font-semibold"
                              : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                          )}
                        >
                          {rating === 0 ? (
                            "Any"
                          ) : (
                            <>
                              <Star
                                className={cn(
                                  "size-3",
                                  selected
                                    ? "fill-black text-black"
                                    : "fill-amber-400 text-amber-400"
                                )}
                              />
                              {rating.toFixed(1)}+
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <SectionHeader title="Vote Count" />
                  <div className="flex flex-wrap gap-1.5">
                    {VOTE_COUNT_OPTIONS.map((opt) => {
                      const selected = filters.minVotes === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onUpdateFilters({ minVotes: opt.value })}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                            selected
                              ? "border-white bg-white text-black font-semibold"
                              : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <hr className="border-white/[0.06]" />

              {/* 5. Runtime */}
              <section>
                <SectionHeader
                  title={mediaType === "movie" ? "Runtime" : "Episode Length"}
                />
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ runtimePreset: "" })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                      filters.runtimePreset === ""
                        ? "border-white bg-white text-black font-semibold"
                        : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                    )}
                  >
                    Any
                  </button>
                  {runtimePresets.map((preset) => {
                    const selected = filters.runtimePreset === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() =>
                          onUpdateFilters({
                            runtimePreset: selected ? "" : preset.value,
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer tabular-nums",
                          selected
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <hr className="border-white/[0.06]" />

              {/* 6. Original Language */}
              <section>
                <SectionHeader title="Original Language" />
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => onUpdateFilters({ language: "" })}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                      filters.language === ""
                        ? "border-white bg-white text-black font-semibold"
                        : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                    )}
                  >
                    All Languages
                  </button>
                  {LANGUAGES.map((lang) => {
                    const selected = filters.language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() =>
                          onUpdateFilters({
                            language: selected ? "" : lang.code,
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          selected
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                        )}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <hr className="border-white/[0.06]" />

              {/* 7. Format Specifics */}
              {mediaType === "movie" ? (
                <section>
                  <SectionHeader title="Content Rating" meta="US" />
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateFilters({ certification: "" })}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                        filters.certification === ""
                          ? "border-white bg-white text-black font-semibold"
                          : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                      )}
                    >
                      Any
                    </button>
                    {MOVIE_CERTIFICATIONS.map((cert) => {
                      const selected = filters.certification === cert;
                      return (
                        <button
                          key={cert}
                          type="button"
                          onClick={() =>
                            onUpdateFilters({
                              certification: selected ? "" : cert,
                            })
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                            selected
                              ? "border-white bg-white text-black font-semibold"
                              : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                          )}
                        >
                          {cert}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="space-y-4">
                  <div>
                    <SectionHeader title="Networks" />
                    <div className="flex flex-wrap gap-1.5">
                      {TV_NETWORKS.map((net) => {
                        const selected = filters.networks.includes(net.id);
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => toggleNetwork(net.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                              selected
                                ? "border-white bg-white text-black font-semibold"
                                : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                            )}
                          >
                            <Tv className="size-3 opacity-70" />
                            {net.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <SectionHeader title="Series Status" />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateFilters({ tvStatus: "" })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          filters.tvStatus === ""
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                        )}
                      >
                        Any
                      </button>
                      {TV_STATUSES.map((st) => {
                        const selected = filters.tvStatus === st.value;
                        return (
                          <button
                            key={st.value}
                            type="button"
                            onClick={() =>
                              onUpdateFilters({
                                tvStatus: selected ? "" : st.value,
                              })
                            }
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                              selected
                                ? "border-white bg-white text-black font-semibold"
                                : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                            )}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <SectionHeader title="Series Format" />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateFilters({ tvType: "" })}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          filters.tvType === ""
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                        )}
                      >
                        Any
                      </button>
                      {TV_TYPES.map((t) => {
                        const selected = filters.tvType === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() =>
                              onUpdateFilters({
                                tvType: selected ? "" : t.value,
                              })
                            }
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                              selected
                                ? "border-white bg-white text-black font-semibold"
                                : "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                            )}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              <hr className="border-white/[0.06]" />

              {/* 8. Personal Library */}
              <section>
                <SectionHeader
                  title="Your Library"
                  meta={!isSignedIn ? "Sign in" : undefined}
                />
                <div className="space-y-2">
                  {[
                    {
                      key: "hideWatchlisted" as const,
                      label: "Hide items in my Watchlist",
                      checked: filters.hideWatchlisted,
                    },
                    {
                      key: "hideWatched" as const,
                      label: "Hide items I've already Watched",
                      checked: filters.hideWatched,
                    },
                  ].map((toggle) => (
                    <button
                      key={toggle.key}
                      type="button"
                      role="switch"
                      aria-checked={toggle.checked}
                      onClick={() => handleLibraryToggle(toggle.key)}
                      className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"
                    >
                      <span className="text-xs font-medium text-zinc-200">
                        {toggle.label}
                      </span>
                      <span
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                          toggle.checked ? "bg-white" : "bg-white/15"
                        )}
                      >
                        <span
                          className={cn(
                            "size-3.5 rounded-full transition-transform",
                            toggle.checked
                              ? "translate-x-4.5 bg-black"
                              : "translate-x-1 bg-zinc-300"
                          )}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Sticky Footer */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] bg-[#0a0a0d]/95 px-5 py-3.5 sm:px-6">
              <button
                type="button"
                onClick={onResetAll}
                disabled={activeCount === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 text-xs font-bold text-black shadow-[0_6px_24px_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-200 active:scale-98 cursor-pointer"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    View {resultSummaryCount.toLocaleString()} {displayNoun}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
