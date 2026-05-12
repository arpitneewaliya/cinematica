"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";
import { useAuth } from "@clerk/nextjs";


interface WatchlistButtonProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  initialIsSaved: boolean;
}

export function WatchlistButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  initialIsSaved,
}: WatchlistButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();
  const { isSignedIn } = useAuth();

  const handleToggle = () => {
    if (!isSignedIn) {
      alert("Please sign in to add to watchlist");
      return;
    }

    startTransition(async () => {
      // Optimistic update
      const newSavedState = !isSaved;
      setIsSaved(newSavedState);

      if (newSavedState) {
        const res = await addToWatchlist({
          mediaId,
          mediaType,
          title,
          posterPath,
          backdropPath,
          releaseDate,
        });
        if (!res.success) {
          setIsSaved(!newSavedState); // Revert on failure
        }
      } else {
        const res = await removeFromWatchlist(mediaId, mediaType);
        if (!res.success) {
          setIsSaved(!newSavedState); // Revert on failure
        }
      }
    });
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      className={`gap-2 font-semibold rounded-full px-6 transition-all duration-300 ${
        isSaved
          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          : "bg-background/20 hover:bg-background/40 backdrop-blur-md border-white/20 text-white"
      }`}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isSaved ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      {isSaved ? "Added" : "Add to Watchlist"}
    </Button>
  );
}
