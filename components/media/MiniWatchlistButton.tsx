"use client";

import { useTransition } from "react";
import { Bookmark, Check } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { TMDBItem } from "@/lib/tmdb";
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { cn } from "@/lib/utils";

interface MiniWatchlistButtonProps {
  item: TMDBItem;
  isSaved?: boolean;
  onToggle?: (id: number) => void;
  className?: string;
}

export function MiniWatchlistButton({
  item,
  isSaved: propIsSaved,
  onToggle,
  className,
}: MiniWatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { isSaved: checkIsSaved, toggleWatchlist } = useWatchlist();

  const isSaved = propIsSaved !== undefined ? propIsSaved : checkIsSaved(item.id, item.media_type);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    startTransition(async () => {
      if (onToggle) {
        onToggle(item.id);
      }
      await toggleWatchlist({
        mediaId: item.id,
        mediaType: item.media_type,
        title: item.title || item.name || "Unknown",
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        releaseDate: item.release_date || item.first_air_date,
      });
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "absolute top-2 left-2 z-10 flex size-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer active:scale-90 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        isSaved
          ? "border-white bg-white text-black opacity-100 shadow-[0_4px_16px_rgba(255,255,255,0.28)]"
          : "border-white/15 bg-black/65 text-white hover:border-white/35 hover:bg-black/85 md:opacity-0 md:group-hover:opacity-100",
        className
      )}
    >
      {isSaved ? (
        <Check className="size-3.5 stroke-[2.75]" />
      ) : (
        <Bookmark className="size-3.5" />
      )}
    </button>
  );
}
