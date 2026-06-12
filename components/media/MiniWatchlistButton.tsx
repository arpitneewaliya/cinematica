"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Check } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";
import { useAuth } from "@clerk/nextjs";
import { TMDBItem } from "@/lib/tmdb";

interface MiniWatchlistButtonProps {
  item: TMDBItem;
  isSaved: boolean;
  onToggle: (id: number) => void;
}

export function MiniWatchlistButton({ item, isSaved, onToggle }: MiniWatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      alert("Please sign in to add to your watchlist.");
      return;
    }

    startTransition(async () => {
      // Optimistic update
      const newSavedState = !isSaved;
      onToggle(item.id);

      if (newSavedState) {
        const title = item.title || item.name || "Unknown";
        const res = await addToWatchlist({
          mediaId: item.id,
          mediaType: item.media_type,
          title,
          posterPath: item.poster_path,
          backdropPath: item.backdrop_path,
          releaseDate: item.release_date || item.first_air_date,
        });
        if (!res.success) {
          onToggle(item.id); // Revert on failure
        }
      } else {
        const res = await removeFromWatchlist(item.id, item.media_type);
        if (!res.success) {
          onToggle(item.id); // Revert on failure
        }
      }
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
    >
      {isSaved ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Bookmark className="w-4 h-4 md:w-5 md:h-5" />}
    </Button>
  );
}
