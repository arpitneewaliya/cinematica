"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Film, Star, Tv } from "lucide-react";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { getGenreMap } from "@/lib/explore-config";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";
import { MiniWatchlistButton } from "@/components/media/MiniWatchlistButton";

interface ExploreEditorialCardProps {
  item: TMDBItem;
  isWatched?: boolean;
}

export function ExploreEditorialCard({
  item,
  isWatched = false,
}: ExploreEditorialCardProps) {
  const router = useRouter();
  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date;
  const { year, isUpcoming } = getMediaReleaseInfo(releaseDate);
  const href = `/${item.media_type}/${item.id}`;
  const posterUrl = getImageUrl(item.poster_path, "w342");
  const genreMap = getGenreMap(item.media_type);
  const genres = (item.genre_ids || [])
    .map((id) => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);

  const handlePrefetch = () => {
    router.prefetch(href);
  };

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className="group flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-[0_20px_50px_-16px_rgba(0,0,0,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      {/* Left 2:3 Poster */}
      <div className="relative aspect-[2/3] w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="120px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-600">
            {item.media_type === "movie" ? (
              <Film className="size-7 stroke-[1.5]" />
            ) : (
              <Tv className="size-7 stroke-[1.5]" />
            )}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
        <MiniWatchlistButton item={item} />
      </div>

      {/* Right Editorial Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-heading text-base font-bold tracking-tight text-white transition-colors group-hover:text-white">
                {title}
              </h3>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400 tabular-nums">
                <span>{year || "TBA"}</span>
                {isUpcoming && (
                  <span className="rounded-full border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-zinc-200">
                    Upcoming
                  </span>
                )}
                {isWatched && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Watched
                  </span>
                )}
              </div>
            </div>

            {item.vote_average > 0 && (
              <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/12 bg-black/50 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {formatMediaRating(item.vote_average)}
              </div>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {genres.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-zinc-300"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs leading-relaxed text-zinc-400 line-clamp-3">
            {item.overview || "Synopsis not yet available for this title."}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-end text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-200">
          <span>View details</span>
          <ArrowUpRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
