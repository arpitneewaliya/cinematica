"use client";

import { useState, useTransition } from "react";
import { X, Star, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToWatchedHistory } from "@/app/actions/watched";

interface LogWatchedModalProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  onClose: () => void;
  onSuccess?: () => void;
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
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [watchedAt, setWatchedAt] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
        notes: notes.trim() !== "" ? notes : null,
        watchedAt: new Date(watchedAt),
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-zinc-950/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-xl font-bold text-white">Log Watch</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[320px]">
              {title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> Date Watched
            </label>
            <input
              type="date"
              value={watchedAt}
              max={new Date().toISOString().substring(0, 10)}
              onChange={(e) => setWatchedAt(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
              required
            />
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Your Rating
            </label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-gray-600 hover:scale-110 transition-all duration-150 p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]"
                        : "text-zinc-600"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm font-semibold text-yellow-500 ml-2">
                  {rating} / 5 Stars
                </span>
              )}
            </div>
          </div>

          {/* Notes/Review */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" /> Review / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you think of this? Add a quick review or log notes..."
              rows={4}
              className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none placeholder-gray-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-sm font-medium text-gray-300 hover:text-white rounded-full px-6 py-2.5 h-auto transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="relative overflow-hidden rounded-full font-bold px-8 py-2.5 h-auto text-sm bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/20 active:scale-95"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Logging...
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
