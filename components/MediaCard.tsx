"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { Film, Star, Tv } from "lucide-react";
import { MiniWatchlistButton } from "./media/MiniWatchlistButton";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";
import { useWatchlist } from "@/components/providers/WatchlistProvider";

interface MediaCardProps {
  item: TMDBItem;
  isSaved?: boolean;
  onToggleWatchlist?: (id: number) => void;
  showWatchlistButton?: boolean;
}

export function MediaCard({
  item,
  isSaved: propIsSaved,
  onToggleWatchlist,
  showWatchlistButton = true,
}: MediaCardProps) {
  const router = useRouter();
  const { isSaved: checkIsSaved } = useWatchlist();
  const isSaved =
    propIsSaved !== undefined ? propIsSaved : checkIsSaved(item.id, item.media_type);

  const title = item.title || item.name || "Untitled";
  const releaseDate = item.release_date || item.first_air_date;
  const { year, isUpcoming } = getMediaReleaseInfo(releaseDate);
  const href = `/${item.media_type}/${item.id}`;
  const posterUrl = getImageUrl(item.poster_path, "w500");

  const handlePrefetch = () => {
    router.prefetch(href);
  };

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      className="group block select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#070708]"
    >
      {/* Unobstructed 2:3 Poster Frame */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900/90 ring-1 ring-white/10 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:ring-white/25 group-hover:shadow-[0_22px_45px_-14px_rgba(0,0,0,0.88)]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 480px) 46vw, (max-width: 768px) 31vw, (max-width: 1024px) 23vw, 17vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-900 text-zinc-600">
            {item.media_type === "movie" ? (
              <Film className="size-8 stroke-[1.5]" />
            ) : (
              <Tv className="size-8 stroke-[1.5]" />
            )}
            <span className="px-3 text-center text-xs font-medium text-zinc-500 line-clamp-2">
              {title}
            </span>
          </div>
        )}

        {/* Subtle top gradient on hover so top badges remain legible over bright posters */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/65 via-black/20 to-transparent opacity-60 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100" />

        {/* Subtle inner specular border */}
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />

        {showWatchlistButton && (
          <MiniWatchlistButton
            item={item}
            isSaved={isSaved}
            onToggle={onToggleWatchlist}
          />
        )}

        {item.vote_average > 0 && (
          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md tabular-nums transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span>{formatMediaRating(item.vote_average)}</span>
          </div>
        )}
      </div>

      {/* Crisp Editorial Caption Below Artwork */}
      <div className="mt-2.5 space-y-0.5 px-0.5">
        <h3 className="truncate font-heading text-[13px] sm:text-sm font-semibold tracking-tight text-zinc-200 transition-colors duration-200 group-hover:text-white">
          {title}
        </h3>
        <p className="truncate text-[11px] sm:text-xs font-medium text-zinc-500 tabular-nums">
          {year || "TBA"}
          {isUpcoming ? " · Upcoming" : ""}
          {" · "}
          {item.media_type === "movie" ? "Film" : "Series"}
        </p>
      </div>
    </Link>
  );
}
