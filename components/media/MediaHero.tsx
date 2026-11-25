"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/tmdb";
import { WatchlistButton } from "./WatchlistButton";
import { WatchedButton } from "./WatchedButton";
import { AddToCustomListButton } from "./AddToCustomListButton";
import { TrailerModal } from "./TrailerModal";
import { Star, Clock, Calendar, Film, Tv, Share2, Check } from "lucide-react";
import { Video } from "@/types/tmdb";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";

export interface KeyCrewCredit {
  id: number;
  name: string;
  role: string;
}

interface MediaHeroProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  backdropPath: string | null;
  posterPath: string | null;
  rating: number;
  voteCount?: number;
  releaseDate: string | null;
  lastAirDate?: string | null;
  runtime?: number | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  status?: string;
  inProduction?: boolean;
  tagline?: string;
  certification?: string | null;
  genres: { id: number; name: string }[];
  videos: Video[];
  logoPath?: string | null;
  logoAspectRatio?: number | null;
  keyCrew?: KeyCrewCredit[];
  isSaved?: boolean;
  initialWatchCount?: number;
  initialLastRating?: number | null;
}

function formatVoteCount(count?: number): string {
  if (!count || count <= 0) return "";
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  }
  return String(count);
}

function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function MediaHero({
  id,
  type,
  title,
  overview,
  backdropPath,
  posterPath,
  rating,
  voteCount,
  releaseDate,
  lastAirDate,
  runtime,
  numberOfSeasons,
  numberOfEpisodes,
  status,
  inProduction,
  tagline,
  certification,
  genres,
  videos,
  logoPath,
  logoAspectRatio,
  keyCrew = [],
  isSaved = false,
  initialWatchCount = 0,
  initialLastRating = null,
}: MediaHeroProps) {
  const [copied, setCopied] = React.useState(false);

  const releaseInfo = getMediaReleaseInfo(releaseDate);
  const endYear = lastAirDate?.match(/^\d{4}/)?.[0] ?? "";
  const yearLabel =
    type === "tv" && releaseInfo.year
      ? inProduction || status === "Returning Series"
        ? `${releaseInfo.year}–Present`
        : endYear && endYear !== releaseInfo.year
        ? `${releaseInfo.year}–${endYear}`
        : releaseInfo.year
      : releaseInfo.year;

  const trailer =
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v) => v.type === "Teaser" && v.site === "YouTube") ||
    videos.find((v) => v.site === "YouTube");

  const backdropUrl = getImageUrl(backdropPath || posterPath, "original");
  const posterUrl = getImageUrl(posterPath, "w500");
  const logoHeight = logoAspectRatio ? Math.round(520 / logoAspectRatio) : 160;
  const runtimeLabel = formatRuntime(runtime);
  const votesLabel = formatVoteCount(voteCount);
  const genreBasePath = type === "movie" ? "/movies" : "/tv";

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — Cinematica`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or Web Share unsupported in this context; fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section className="relative min-h-[72svh] w-full overflow-hidden bg-[#070708] pt-28 pb-10 md:pt-36 md:pb-14 flex items-end">
      {/* Static High-Resolution Backdrop & Multi-Stop Obsidian Vignettes */}
      <div className="pointer-events-none absolute inset-0 select-none">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={title}
            fill
            priority
            className="object-cover object-top opacity-65"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/78 to-[#070708]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708]/95 via-[#070708]/55 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      </div>

      {/* Unified Above-the-Fold 2-Column Editorial Stage */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex flex-col md:flex-row gap-7 md:gap-10 lg:gap-12 items-start md:items-end">
          {/* Framed 2:3 Poster */}
          <div className="relative w-40 sm:w-48 md:w-60 lg:w-68 shrink-0 aspect-[2/3] overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/15 shadow-[0_28px_70px_-12px_rgba(0,0,0,0.95)]">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 272px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-600">
                {type === "movie" ? (
                  <Film className="size-10 stroke-[1.5]" />
                ) : (
                  <Tv className="size-10 stroke-[1.5]" />
                )}
                <span className="px-4 text-center text-xs text-zinc-500">{title}</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]" />
          </div>

          {/* Title, Metadata, Synopsis, Crew & Complete Action Bar */}
          <div className="flex-1 min-w-0 max-w-3xl space-y-4 sm:space-y-5">
            {/* Eyebrow Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                {type === "movie" ? "Feature Film" : "Television Series"}
              </span>

              {certification && (
                <span className="rounded-md border border-white/18 bg-black/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-200 backdrop-blur-md">
                  {certification}
                </span>
              )}

              {releaseInfo.isUpcoming ? (
                <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-200">
                  Upcoming
                </span>
              ) : status && status !== "Released" ? (
                <span className="rounded-full border border-white/12 bg-black/40 px-3 py-1 text-[11px] font-medium text-zinc-300 backdrop-blur-md">
                  {status}
                </span>
              ) : null}
            </div>

            {/* Title / Official Film Logo + Tagline */}
            <div className="space-y-2">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.04]">
                {logoPath ? (
                  <>
                    <span className="sr-only">{title}</span>
                    <Image
                      src={getImageUrl(logoPath, "original")}
                      alt=""
                      width={520}
                      height={logoHeight}
                      priority
                      className="block h-auto max-h-20 sm:max-h-24 md:max-h-32 w-auto max-w-[min(82vw,480px)] object-contain object-left drop-shadow-[0_8px_28px_rgba(0,0,0,0.9)]"
                    />
                  </>
                ) : (
                  <span className="drop-shadow-[0_6px_28px_rgba(0,0,0,0.9)]">
                    {title}
                  </span>
                )}
              </h1>

              {tagline && (
                <p className="text-sm sm:text-base italic text-zinc-400 font-normal">
                  &ldquo;{tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Unified Metadata Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-medium text-zinc-300">
              {rating > 0 ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-white tabular-nums">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{formatMediaRating(rating)}</span>
                  {votesLabel && (
                    <span className="text-xs font-normal text-zinc-400">
                      ({votesLabel})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-zinc-400">Not rated yet</span>
              )}

              {yearLabel && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-zinc-200">
                    <Calendar className="size-3.5 text-zinc-400" />
                    {yearLabel}
                  </span>
                </>
              )}

              {runtimeLabel && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-zinc-200">
                    <Clock className="size-3.5 text-zinc-400" />
                    {runtimeLabel}
                  </span>
                </>
              )}

              {type === "tv" && numberOfSeasons && numberOfSeasons > 0 ? (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="tabular-nums text-zinc-200">
                    {numberOfSeasons} {numberOfSeasons === 1 ? "Season" : "Seasons"}
                    {numberOfEpisodes ? ` · ${numberOfEpisodes} Episodes` : ""}
                  </span>
                </>
              ) : null}
            </div>

            {/* Clickable Genre Pills */}
            {genres.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`${genreBasePath}?genre=${g.id}`}
                    className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs font-medium text-zinc-200 backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/[0.13] hover:text-white active:scale-95"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Full Readable Synopsis */}
            <p className="max-w-3xl text-sm sm:text-base leading-relaxed text-zinc-200/95">
              {overview || "No synopsis available for this title."}
            </p>

            {/* Key Crew Links */}
            {keyCrew.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-0.5 text-xs sm:text-sm">
                {keyCrew.map((member) => (
                  <div key={`${member.role}-${member.id}`} className="flex items-center gap-1.5">
                    <span className="text-zinc-500">{member.role}</span>
                    <Link
                      href={`/person/${member.id}`}
                      className="font-semibold text-zinc-100 underline-offset-4 hover:text-white hover:underline"
                    >
                      {member.name}
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Complete Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {trailer && <TrailerModal video={trailer} className="h-11" />}

              <WatchlistButton
                mediaId={id}
                mediaType={type}
                title={title}
                posterPath={posterPath}
                backdropPath={backdropPath}
                releaseDate={releaseDate}
                initialIsSaved={isSaved}
                className="h-11"
              />

              <WatchedButton
                mediaId={id}
                mediaType={type}
                title={title}
                posterPath={posterPath}
                backdropPath={backdropPath}
                releaseDate={releaseDate}
                runtime={runtime}
                initialWatchCount={initialWatchCount}
                initialLastRating={initialLastRating}
                className="h-11"
              />

              <AddToCustomListButton
                mediaId={id}
                mediaType={type}
                title={title}
                posterPath={posterPath}
                backdropPath={backdropPath}
                releaseDate={releaseDate}
                className="h-11"
              />

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share or copy link"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 text-xs sm:text-sm font-semibold text-zinc-200 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.14] hover:text-white active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-4 text-white" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-4" />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
