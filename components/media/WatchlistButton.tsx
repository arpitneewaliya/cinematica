"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
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
  const { openSignIn } = useClerk();
  const { isSaved: checkIsSaved, toggleWatchlist } = useWatchlist();

  const isSaved = initialIsSaved || checkIsSaved(mediaId, mediaType);

  const handleToggle = () => {
    if (!isSignedIn) {
      openSignIn();
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
        "gap-2 font-semibold rounded-full px-6 transition-all duration-300 cursor-pointer",
        isSaved
          ? "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10"
          : "bg-white/8 hover:bg-white/15 backdrop-blur-md border-white/15 text-white hover:text-white",
        className
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4" />}
      {isSaved ? "Saved" : "Watchlist"}
    </Button>
  );
}
