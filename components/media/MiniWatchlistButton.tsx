"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Check } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { TMDBItem } from "@/lib/tmdb";
import { useWatchlist } from "@/components/providers/WatchlistProvider";

interface MiniWatchlistButtonProps {
  item: TMDBItem;
  isSaved?: boolean;
  onToggle?: (id: number) => void;
}

export function MiniWatchlistButton({ item, isSaved: propIsSaved, onToggle }: MiniWatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const { isSaved: checkIsSaved, toggleWatchlist } = useWatchlist();

  const isSaved = propIsSaved !== undefined ? propIsSaved : checkIsSaved(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      alert("Please sign in to add to your watchlist.");
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
    <Button
      variant="ghost"
      size="icon"
      className={`absolute top-2 left-2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 ${
        isSaved
          ? "bg-primary/90 text-primary-foreground opacity-100"
          : "bg-black/40 text-white md:opacity-0 md:group-hover:opacity-100 hover:bg-black/60"
      }`}
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
    >
      {isSaved ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Bookmark className="w-4 h-4 md:w-5 md:h-5" />}
    </Button>
  );
}
