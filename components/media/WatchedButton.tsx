"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Star } from "lucide-react";
import { LogWatchedModal } from "./LogWatchedModal";
import { useAuth } from "@clerk/nextjs";

interface WatchedButtonProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  initialWatchCount: number;
  initialLastRating?: number | null;
}

export function WatchedButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  initialWatchCount,
  initialLastRating = null,
}: WatchedButtonProps) {
  const [watchCount, setWatchCount] = useState(initialWatchCount);
  const [lastRating, setLastRating] = useState<number | null>(initialLastRating);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const handleOpenModal = () => {
    if (!isSignedIn) {
      alert("Please sign in to log watch history");
      return;
    }
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setWatchCount((prev) => prev + 1);
  };

  const isWatched = watchCount > 0;

  return (
    <>
      <Button
        variant={isWatched ? "secondary" : "outline"}
        onClick={handleOpenModal}
        className={`gap-2 font-semibold rounded-full px-6 transition-all duration-300 ${
          isWatched
            ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5 hover:scale-[1.02] active:scale-95"
            : "bg-background/20 hover:bg-background/40 backdrop-blur-md border-white/20 text-white hover:scale-[1.02] active:scale-95"
        }`}
      >
        <Eye className={`w-5 h-5 transition-transform ${isWatched ? "fill-emerald-400/20 scale-110" : ""}`} />
        <span>
          {isWatched 
            ? `Watched${watchCount > 1 ? ` (${watchCount}x)` : ""}` 
            : "Mark as Watched"
          }
        </span>
        {isWatched && lastRating && (
          <span className="flex items-center gap-0.5 ml-1 pl-2 border-l border-emerald-500/30 text-yellow-500 text-xs">
            <Star className="w-3.5 h-3.5 fill-current" />
            {lastRating}
          </span>
        )}
      </Button>

      {isModalOpen && (
        <LogWatchedModal
          mediaId={mediaId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          backdropPath={backdropPath}
          releaseDate={releaseDate}
          runtime={runtime}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
