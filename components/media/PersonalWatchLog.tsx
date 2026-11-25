"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Calendar, Plus, Star, Trash2 } from "lucide-react";
import { useOptionalMediaWatch } from "./MediaWatchContext";
import { Button } from "@/components/ui/button";

export function PersonalWatchLog() {
  const { isSignedIn } = useAuth();
  const watchContext = useOptionalMediaWatch();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isSignedIn || !watchContext || watchContext.entries.length === 0) {
    return null;
  }

  const { entries, openLogModal, deleteEntry } = watchContext;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEntry(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      aria-labelledby="personal-watch-log-heading"
      className="container mx-auto px-4 sm:px-6 md:px-10 pt-6 md:pt-8"
    >
      <div className="glass-panel rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Personal History
            </p>
            <h2
              id="personal-watch-log-heading"
              className="font-heading text-base sm:text-lg font-bold text-white"
            >
              Your Watch Log
            </h2>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openLogModal}
            className="h-8 rounded-full border-white/15 bg-white/[0.06] px-3.5 text-xs font-medium text-white hover:bg-white/14 hover:text-white cursor-pointer"
          >
            <Plus className="size-3.5 mr-1" />
            Log Rewatch
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {entries.map((entry) => {
            const formattedDate = new Date(entry.watchedAt).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            );

            return (
              <div
                key={entry.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-white/15"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-300 tabular-nums">
                      <Calendar className="size-3.5 text-zinc-500" />
                      {formattedDate}
                    </span>

                    {entry.rating && entry.rating > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white tabular-nums">
                        {Array.from({ length: entry.rating }).map((_, idx) => (
                          <Star
                            key={idx}
                            className="size-2.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                        <span className="ml-1 text-zinc-300">{entry.rating}/5</span>
                      </span>
                    )}
                  </div>

                  {entry.notes ? (
                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-300">
                      {entry.notes}
                    </p>
                  ) : (
                    <p className="text-xs italic text-zinc-500">
                      Logged without written notes.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={deletingId === entry.id}
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Delete watch entry"
                  className="shrink-0 rounded-full p-2 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
