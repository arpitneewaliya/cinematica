"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Eye,
  Film,
  Sparkles,
  Star,
  Tv,
  UserCheck,
} from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { PersonDetails } from "@/types/tmdb";
import { NormalizedPersonCredit, PersonCareerStats } from "@/lib/person-credits";
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { cn } from "@/lib/utils";

interface PersonBentoGridProps {
  person: PersonDetails;
  credits: NormalizedPersonCredit[];
  stats: PersonCareerStats;
  defaultHideSelf: boolean;
  watchedMap: Map<string, number | null>;
  selectedDecade: string | null;
  selectedGenreId: number | null;
  watchStatus: "all" | "unwatched" | "watched";
  onSelectDecade: (decade: string) => void;
  onSelectGenre: (genreId: number) => void;
  onSelectWatchStatus: (status: "all" | "unwatched" | "watched") => void;
}

function formatFullDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calculateAge(birthday: string, deathday?: string | null): number | null {
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;
  const end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(end.getTime())) return null;
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getGenderLabel(code: number): string | null {
  switch (code) {
    case 1:
      return "Female";
    case 2:
      return "Male";
    case 3:
      return "Non-binary";
    default:
      return null;
  }
}

export function PersonBentoGrid({
  person,
  credits,
  stats,
  defaultHideSelf,
  watchedMap,
  selectedDecade,
  selectedGenreId,
  watchStatus,
  onSelectDecade,
  onSelectGenre,
  onSelectWatchStatus,
}: PersonBentoGridProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { isSaved } = useWatchlist();
  const [showAllAliases, setShowAllAliases] = React.useState(false);

  const releasedPool = React.useMemo(
    () =>
      credits.filter(
        (c) => !c.isUpcoming && (!defaultHideSelf || !c.isSelfAppearance)
      ),
    [credits, defaultHideSelf]
  );

  const { watchedCount, personalAvgRating, watchlistedCount } = React.useMemo(() => {
    if (!isSignedIn) {
      return { watchedCount: 0, personalAvgRating: null, watchlistedCount: 0 };
    }
    let watched = 0;
    let ratingSum = 0;
    let ratedCount = 0;
    let saved = 0;

    for (const c of releasedPool) {
      if (watchedMap.has(c.key)) {
        watched++;
        const r = watchedMap.get(c.key);
        if (typeof r === "number" && r > 0) {
          ratingSum += r;
          ratedCount++;
        }
      }
      if (isSaved(c.id, c.mediaType)) {
        saved++;
      }
    }

    return {
      watchedCount: watched,
      personalAvgRating:
        ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : null,
      watchlistedCount: saved,
    };
  }, [isSignedIn, releasedPool, watchedMap, isSaved]);

  const totalReleased = releasedPool.length;
  const unwatchedCount = Math.max(0, totalReleased - watchedCount);
  const completionPct =
    totalReleased > 0 ? Math.round((watchedCount / totalReleased) * 100) : 0;

  const maxDecadeCount = Math.max(
    1,
    ...stats.decadeBreakdown.map((d) => d.count)
  );

  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;
  const genderLabel = getGenderLabel(person.gender);
  const aliases = person.also_known_as || [];
  const displayedAliases = showAllAliases ? aliases : aliases.slice(0, 3);

  return (
    <section
      aria-label="Career insights and personal dossier"
      className="container mx-auto px-4 sm:px-6 md:px-10 py-6"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* 1. Personal Completion Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 lg:col-span-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Your Filmography Progress
                </p>
                <h2 className="mt-0.5 font-heading text-base font-bold text-white sm:text-lg">
                  With {person.name}
                </h2>
              </div>
              {isSignedIn && (
                <span className="rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-1 text-xs font-bold text-white tabular-nums">
                  {completionPct}%
                </span>
              )}
            </div>

            {isSignedIn ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-medium text-zinc-300 tabular-nums">
                      <strong className="text-lg font-bold text-white">
                        {watchedCount}
                      </strong>{" "}
                      of {totalReleased} released titles seen
                    </span>
                    {watchlistedCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 tabular-nums">
                        <Bookmark className="size-3" />
                        {watchlistedCount} saved
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>

                {/* Personal stats pills */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Your Avg Rating
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white tabular-nums">
                      {personalAvgRating ? (
                        <>
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {personalAvgRating.toFixed(1)} / 5
                        </>
                      ) : (
                        <span className="text-xs font-medium text-zinc-500">
                          Not rated yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Remaining
                    </div>
                    <div className="mt-1 text-sm font-bold text-white tabular-nums">
                      {unwatchedCount}{" "}
                      <span className="text-xs font-normal text-zinc-400">
                        unseen
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-white/[0.07] bg-black/30 p-4 space-y-3">
                <p className="text-xs leading-relaxed text-zinc-400">
                  Track how many of {person.name}&apos;s{" "}
                  <span className="font-semibold text-zinc-200 tabular-nums">
                    {totalReleased}
                  </span>{" "}
                  released titles you&apos;ve seen and filter by what you still need
                  to watch.
                </p>
                <button
                  type="button"
                  onClick={() => openSignIn()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 cursor-pointer"
                >
                  <UserCheck className="size-3.5" />
                  Sign in to track
                </button>
              </div>
            )}
          </div>

          {isSignedIn && totalReleased > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() =>
                  onSelectWatchStatus(
                    watchStatus === "unwatched" ? "all" : "unwatched"
                  )
                }
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer tabular-nums",
                  watchStatus === "unwatched"
                    ? "border-white bg-white text-black font-semibold"
                    : "border-white/12 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:text-white"
                )}
              >
                <Eye className="size-3.5" />
                Unwatched ({unwatchedCount})
              </button>
              <button
                type="button"
                onClick={() =>
                  onSelectWatchStatus(
                    watchStatus === "watched" ? "all" : "watched"
                  )
                }
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer tabular-nums",
                  watchStatus === "watched"
                    ? "border-white bg-white text-black font-semibold"
                    : "border-white/12 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:text-white"
                )}
              >
                <CheckCircle2 className="size-3.5" />
                Watched ({watchedCount})
              </button>
            </div>
          )}
        </div>

        {/* 2. Interactive Career DNA Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 lg:col-span-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Career DNA
              </p>
              <h2 className="mt-0.5 font-heading text-base font-bold text-white sm:text-lg">
                Trajectory &amp; Signature Genres
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
              <Sparkles className="size-3" />
              Click to filter
            </span>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                Avg Acclaim
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-sm font-bold text-white tabular-nums">
                {stats.averageRating ? (
                  <>
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    {stats.averageRating.toFixed(1)}
                  </>
                ) : (
                  "—"
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                Films
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-white tabular-nums">
                <Film className="size-3.5 text-zinc-400" />
                {stats.movieCount}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                Series
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-white tabular-nums">
                <Tv className="size-3.5 text-zinc-400" />
                {stats.tvCount}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                Span
              </div>
              <div className="mt-0.5 text-sm font-bold text-white tabular-nums">
                {stats.careerSpanYears > 0 ? `${stats.careerSpanYears} yrs` : "—"}
              </div>
            </div>
          </div>

          {stats.highestRatedCredit && (
            <Link
              href={`/${stats.highestRatedCredit.mediaType}/${stats.highestRatedCredit.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/30 px-3.5 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Highest Rated Credit
                </div>
                <div className="truncate text-xs font-semibold text-white group-hover:underline">
                  {stats.highestRatedCredit.title}
                  {stats.highestRatedCredit.year
                    ? ` (${stats.highestRatedCredit.year})`
                    : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {stats.highestRatedCredit.voteAverage.toFixed(1)}
                </span>
                <ArrowUpRight className="size-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
              </div>
            </Link>
          )}

          {/* Interactive Signature Genres */}
          {stats.topGenres.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Signature Genres
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.topGenres.map((genre) => {
                  const active = selectedGenreId === genre.id;
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => onSelectGenre(genre.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                        active
                          ? "border-white bg-white text-black font-semibold"
                          : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-white/25 hover:bg-white/[0.1]"
                      )}
                    >
                      <span>{genre.name}</span>
                      <span
                        className={cn(
                          "text-[10px] tabular-nums",
                          active ? "text-black/70" : "text-zinc-500"
                        )}
                      >
                        {genre.percentage}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Decade Activity */}
          {stats.decadeBreakdown.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Credits by Decade
              </div>
              <div className="space-y-1.5">
                {stats.decadeBreakdown.map((dec) => {
                  const active = selectedDecade === dec.decade;
                  const widthPct = Math.max(
                    10,
                    Math.round((dec.count / maxDecadeCount) * 100)
                  );
                  return (
                    <button
                      key={dec.decade}
                      type="button"
                      onClick={() => onSelectDecade(dec.decade)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors cursor-pointer",
                        active ? "bg-white/12" : "hover:bg-white/[0.05]"
                      )}
                    >
                      <span
                        className={cn(
                          "w-16 shrink-0 font-mono text-[11px] font-semibold tabular-nums",
                          active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                        )}
                      >
                        {dec.decade}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            active
                              ? "bg-white"
                              : "bg-zinc-400/70 group-hover:bg-white/85"
                          )}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-[11px] text-zinc-400 tabular-nums">
                        {dec.count} {dec.avgRating ? `· ★${dec.avgRating}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Personal Dossier Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 lg:col-span-3 space-y-4">
          <div>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Biographical Record
            </p>
            <h2 className="mt-0.5 font-heading text-base font-bold text-white sm:text-lg">
              Personal Info
            </h2>
          </div>

          <dl className="space-y-3.5 text-xs sm:text-[13px]">
            {person.known_for_department && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Known For
                </dt>
                <dd className="mt-0.5 font-medium text-zinc-200">
                  {person.known_for_department}
                </dd>
              </div>
            )}

            {person.birthday && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Born
                </dt>
                <dd className="mt-0.5 font-medium text-zinc-200 tabular-nums">
                  {formatFullDate(person.birthday)}
                  {age !== null && !person.deathday && (
                    <span className="ml-1 text-zinc-400">({age})</span>
                  )}
                </dd>
              </div>
            )}

            {person.deathday && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Died
                </dt>
                <dd className="mt-0.5 font-medium text-zinc-200 tabular-nums">
                  {formatFullDate(person.deathday)}
                  {age !== null && (
                    <span className="ml-1 text-zinc-400">(aged {age})</span>
                  )}
                </dd>
              </div>
            )}

            {person.place_of_birth && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Birthplace
                </dt>
                <dd className="mt-0.5 font-medium leading-relaxed text-zinc-200">
                  {person.place_of_birth}
                </dd>
              </div>
            )}

            {genderLabel && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Gender
                </dt>
                <dd className="mt-0.5 font-medium text-zinc-200">{genderLabel}</dd>
              </div>
            )}

            {aliases.length > 0 && (
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Also Known As
                </dt>
                <dd className="mt-1 space-y-1 text-zinc-300">
                  {displayedAliases.map((alias, idx) => (
                    <div key={idx} className="truncate text-xs" title={alias}>
                      {alias}
                    </div>
                  ))}
                  {aliases.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllAliases((prev) => !prev)}
                      className="pt-0.5 text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showAllAliases
                        ? "Show fewer"
                        : `+${aliases.length - 3} more aliases`}
                    </button>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
