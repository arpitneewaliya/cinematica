"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/components/providers/WatchlistProvider";

interface WatchlistButtonProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  initialIsSaved?: boolean;
  className?: string;
}

export function WatchlistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  initialIsSaved = false,
  className,
}: WatchlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();
  const { isSaved: checkIsSaved, toggleWatchlist } = useWatchlist();

  const isSaved = initialIsSaved || checkIsSaved(mediaId);

  const handleToggle = () => {
    if (!isSignedIn) {
      alert("Please sign in to add to watchlist");
      return;
    }

    startTransition(async () => {
      await toggleWatchlist({
        mediaId,
        mediaType,
        title,
        posterPath,
        backdropPath,
        releaseDate,
      });
    });
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      className={cn(
        "gap-2 font-semibold rounded-full px-6 transition-all duration-300",
        isSaved
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          : "bg-background/20 hover:bg-background/40 backdrop-blur-md border-white/20 text-white",
        className
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      {isSaved ? "Added" : "Add to Watchlist"}
    </Button>
  );
}
