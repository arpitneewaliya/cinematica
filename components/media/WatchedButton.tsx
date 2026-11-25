"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Eye, Star } from "lucide-react";
import { LogWatchedModal } from "./LogWatchedModal";
import { useAuth, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { getWatchedCount, type MediaWatchEntry } from "@/app/actions/watched";
import { useOptionalMediaWatch } from "./MediaWatchContext";

interface WatchedButtonProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  initialWatchCount?: number;
  initialLastRating?: number | null;
  className?: string;
}

export function WatchedButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  initialWatchCount = 0,
  initialLastRating = null,
  className,
}: WatchedButtonProps) {
  const watchContext = useOptionalMediaWatch();
  const [standaloneCount, setStandaloneCount] = useState(initialWatchCount);
  const [standaloneRating, setStandaloneRating] = useState<number | null>(
    initialLastRating
  );
  const [standaloneModalOpen, setStandaloneModalOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  useEffect(() => {
    if (watchContext || !isSignedIn) return;

    let isSubscribed = true;
    getWatchedCount(mediaId, mediaType)
      .then((info) => {
        if (isSubscribed && info.count > 0) {
          setStandaloneCount(info.count);
          setStandaloneRating(info.lastRating);
        }
      })
      .catch((err) => {
        console.error("Failed to load watched count on client:", err);
      });

    return () => {
      isSubscribed = false;
    };
  }, [watchContext, mediaId, mediaType, isSignedIn]);

  const watchCount = watchContext
    ? watchContext.entries.length
    : standaloneCount;
  const lastRating = watchContext
    ? watchContext.entries.find((e) => e.rating && e.rating > 0)?.rating ?? null
    : standaloneRating;

  const isWatched = watchCount > 0;

  const handleOpenModal = () => {
    if (watchContext) {
      watchContext.openLogModal();
      return;
    }
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setStandaloneModalOpen(true);
  };

  const handleStandaloneSuccess = (entry?: MediaWatchEntry) => {
    setStandaloneCount((prev) => prev + 1);
    if (entry?.rating) {
      setStandaloneRating(entry.rating);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={isWatched ? "default" : "outline"}
        onClick={handleOpenModal}
        className={cn(
          "gap-2 rounded-full px-5 font-semibold transition-all duration-200 active:scale-95 cursor-pointer",
          isWatched
            ? "bg-white text-black hover:bg-zinc-200 shadow-[0_6px_24px_rgba(255,255,255,0.16)]"
            : "border-white/15 bg-white/[0.07] text-white backdrop-blur-xl hover:border-white/30 hover:bg-white/[0.14] hover:text-white",
          className
        )}
      >
        {isWatched ? (
          <Check className="size-4 stroke-[2.5]" />
        ) : (
          <Eye className="size-4" />
        )}
        <span>
          {isWatched
            ? `Watched${watchCount > 1 ? ` (${watchCount}×)` : ""}`
            : "Log Watch"}
        </span>
        {isWatched && lastRating && (
          <span className="ml-0.5 flex items-center gap-0.5 border-l border-black/15 pl-2 text-xs font-bold tabular-nums">
            <Star className="size-3 fill-amber-500 text-amber-500" />
            {lastRating}
          </span>
        )}
      </Button>

      {!watchContext && standaloneModalOpen && (
        <LogWatchedModal
          mediaId={mediaId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          backdropPath={backdropPath}
          releaseDate={releaseDate}
          runtime={runtime}
          onClose={() => setStandaloneModalOpen(false)}
          onSuccess={handleStandaloneSuccess}
        />
      )}
    </>
  );
}
