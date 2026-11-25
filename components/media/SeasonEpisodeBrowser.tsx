"use client";

import * as React from "react";
import Image from "next/image";
import { Calendar, Clock, Film, Loader2, Star } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { getTVSeasonAction } from "@/app/actions/media";
import type { TVSeasonDetails, TVSeasonSummary } from "@/types/tmdb";
import { formatMediaRating } from "@/lib/media-display";
import { cn } from "@/lib/utils";

interface SeasonEpisodeBrowserProps {
  tvId: number;
  seasons: TVSeasonSummary[];
  initialSeason: TVSeasonDetails | null;
}

export function SeasonEpisodeBrowser({
  tvId,
  seasons,
  initialSeason,
}: SeasonEpisodeBrowserProps) {
  const orderedSeasons = React.useMemo(() => {
    const regular = seasons.filter((s) => s.season_number > 0);
    return (regular.length > 0 ? regular : seasons).toSorted(
      (a, b) => a.season_number - b.season_number
    );
  }, [seasons]);

  const defaultSeasonNumber =
    initialSeason?.season_number ?? orderedSeasons[0]?.season_number ?? 1;

  const [selectedSeason, setSelectedSeason] = React.useState<number>(
    defaultSeasonNumber
  );
  const [seasonCache, setSeasonCache] = React.useState<
    Record<number, TVSeasonDetails>
  >(() => (initialSeason ? { [initialSeason.season_number]: initialSeason } : {}));
  const [loadingSeason, setLoadingSeason] = React.useState<number | null>(null);

  if (orderedSeasons.length === 0) return null;

  const activeSeasonData = seasonCache[selectedSeason];
  const activeSummary = orderedSeasons.find(
    (s) => s.season_number === selectedSeason
  );

  const handleSelectSeason = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    if (seasonCache[seasonNumber]) return;

    setLoadingSeason(seasonNumber);
    try {
      const fetched = await getTVSeasonAction(tvId, seasonNumber);
      if (fetched) {
        setSeasonCache((prev) => ({ ...prev, [seasonNumber]: fetched }));
      }
    } finally {
      setLoadingSeason((prev) => (prev === seasonNumber ? null : prev));
    }
  };

  return (
    <section
      aria-labelledby="seasons-episodes-heading"
      className="container mx-auto px-4 sm:px-6 md:px-10 pt-8 md:pt-12"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-0.5">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Episode Guide
          </p>
          <h2
            id="seasons-episodes-heading"
            className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
          >
            Seasons & Episodes
          </h2>
        </div>

        {activeSummary && (
          <span className="text-xs font-medium text-zinc-500 tabular-nums">
            {activeSummary.episode_count}{" "}
            {activeSummary.episode_count === 1 ? "Episode" : "Episodes"}
          </span>
        )}
      </div>

      {/* Season Selector Pills */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {orderedSeasons.map((season) => {
          const isSelected = season.season_number === selectedSeason;
          return (
            <button
              key={season.id}
              type="button"
              onClick={() => handleSelectSeason(season.season_number)}
              aria-pressed={isSelected}
              className={cn(
                "shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95",
                isSelected
                  ? "border-white bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.16)]"
                  : "border-white/12 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:bg-white/[0.1] hover:text-white"
              )}
            >
              <span>
                {season.season_number === 0
                  ? "Specials"
                  : `Season ${season.season_number}`}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  isSelected
                    ? "bg-black/15 text-black"
                    : "bg-white/[0.08] text-zinc-400"
                )}
              >
                {season.episode_count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Season Synopsis (if available) */}
      {activeSeasonData?.overview && (
        <p className="mb-5 max-w-3xl text-xs sm:text-sm leading-relaxed text-zinc-400">
          {activeSeasonData.overview}
        </p>
      )}

      {/* Episode List */}
      {loadingSeason === selectedSeason && !activeSeasonData ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3.5 animate-pulse"
            >
              <div className="w-36 sm:w-44 shrink-0 aspect-video rounded-xl bg-white/[0.06]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-3/4 rounded bg-white/[0.08]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
                <div className="h-3 w-full rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      ) : activeSeasonData && activeSeasonData.episodes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {activeSeasonData.episodes.map((ep) => {
            const epNumber = String(ep.episode_number).padStart(2, "0");
            const stillUrl = getImageUrl(ep.still_path, "w500");
            const airDateFormatted = ep.air_date
              ? new Date(ep.air_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <article
                key={ep.id}
                className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-all duration-200 hover:border-white/18 hover:bg-white/[0.05]"
              >
                <div className="relative w-full sm:w-44 shrink-0 aspect-video overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
                  {stillUrl ? (
                    <Image
                      src={stillUrl}
                      alt={ep.name || `Episode ${ep.episode_number}`}
                      fill
                      sizes="(max-width: 640px) 92vw, 176px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <Film className="size-6 stroke-[1.5]" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded-md border border-white/15 bg-black/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white backdrop-blur-md">
                    E{epNumber}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-sm font-semibold text-zinc-100 group-hover:text-white line-clamp-1">
                      {ep.name || `Episode ${ep.episode_number}`}
                    </h3>
                    {ep.vote_average > 0 && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-zinc-200 tabular-nums">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {formatMediaRating(ep.vote_average)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-zinc-500 tabular-nums">
                    {airDateFormatted && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {airDateFormatted}
                      </span>
                    )}
                    {ep.runtime && ep.runtime > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {ep.runtime}m
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {ep.overview || "Episode synopsis unavailable."}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-white/10 p-6 text-xs text-zinc-500">
          {loadingSeason === selectedSeason ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading episodes...</span>
            </>
          ) : (
            <span>No episode details available for this season.</span>
          )}
        </div>
      )}
    </section>
  );
}
