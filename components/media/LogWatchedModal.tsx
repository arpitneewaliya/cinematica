"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Star, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToWatchedHistory, type MediaWatchEntry } from "@/app/actions/watched";
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { cn } from "@/lib/utils";

interface LogWatchedModalProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  onClose: () => void;
  onSuccess?: (entry?: MediaWatchEntry) => void;
}

export function LogWatchedModal({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  onClose,
  onSuccess,
}: LogWatchedModalProps) {
  const { removeLocalItem } = useWatchlist();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [watchedAt, setWatchedAt] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await addToWatchedHistory({
        mediaId,
        mediaType,
        title,
        posterPath,
        backdropPath,
        releaseDate,
        runtime,
        rating: rating > 0 ? rating : null,
        notes: notes.trim() !== "" ? notes.trim() : null,
        watchedAt: new Date(watchedAt),
      });

      if (res.success && res.item) {
        removeLocalItem(mediaId, mediaType);
        if (onSuccess) {
          onSuccess({
            id: res.item.id,
            watchedAt: res.item.watchedAt,
            rating: res.item.rating,
            notes: res.item.notes,
            runtime: res.item.runtime,
          });
        }
        onClose();
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/82 p-4 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-watch-title"
        className="glass-panel relative w-full max-w-lg rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08]">
          <div className="min-w-0 pr-4">
            <h3 id="log-watch-title" className="font-heading text-lg font-bold text-white">
              Log Watch
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-400 transition-colors hover:bg-white/12 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="watched-at-input"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400"
            >
              <Calendar className="size-3.5" /> Date Watched
            </label>
            <input
              id="watched-at-input"
              type="date"
              value={watchedAt}
              max={new Date().toISOString().substring(0, 10)}
              onChange={(e) => setWatchedAt(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white focus:border-white/35 focus:outline-none transition-colors cursor-pointer"
              required
            />
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Your Rating
              </span>
              {rating > 0 && (
                <button
                  type="button"
                  onClick={() => setRating(0)}
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 py-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} out of 5 stars`}
                    onClick={() => setRating((prev) => (prev === star ? 0 : star))}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform duration-150 hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        "size-7 transition-colors",
                        active
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.28)]"
                          : "text-zinc-700 hover:text-zinc-500"
                      )}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-xs font-semibold text-zinc-200 tabular-nums">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Notes / Review */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="watched-notes-input"
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400"
            >
              <MessageSquare className="size-3.5" /> Review / Notes
            </label>
            <textarea
              id="watched-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write a brief thought or review note..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-white/35 focus:outline-none transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-white/[0.08] pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-10 rounded-full px-5 text-xs sm:text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-full bg-white px-6 text-xs sm:text-sm font-semibold text-black hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
