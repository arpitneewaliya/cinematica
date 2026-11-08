"use client";

import * as React from "react";
import Link from "next/link";
import { PersonCreditCastItem } from "@/types/tmdb";
import { Film, Tv, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMediaRating } from "@/lib/media-display";

interface PersonFilmographyProps {
  credits: PersonCreditCastItem[];
}

export function PersonFilmography({ credits }: PersonFilmographyProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | "movie" | "tv">("all");

  // Sort chronologically descending (newest first, no-date items at top)
  const sortedCredits = React.useMemo(() => {
    return [...credits].sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      if (!dateA && !dateB) return 0;
      if (!dateA) return -1;
      if (!dateB) return 1;
      return dateB.localeCompare(dateA);
    });
  }, [credits]);

  const movies = React.useMemo(
    () => sortedCredits.filter((c) => c.media_type === "movie"),
    [sortedCredits]
  );

  const tvShows = React.useMemo(
    () => sortedCredits.filter((c) => c.media_type === "tv"),
    [sortedCredits]
  );

  const renderCreditList = (items: PersonCreditCastItem[]) => {
    if (items.length === 0) {
      return (
        <div className="py-12 text-center text-zinc-500 rounded-xl border border-white/5 bg-white/[0.02]">
          No credits found in this category.
        </div>
      );
    }

    return (
      <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md overflow-hidden">
        {items.map((item, index) => {
          const date = item.release_date || item.first_air_date;
          const year = date ? date.substring(0, 4) : "—";
          const title = item.title || item.name || "Untitled";

          return (
            <div
              key={`${item.media_type}-${item.id}-${index}`}
              className="flex items-center justify-between gap-4 p-3.5 sm:p-4 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-400 w-10 sm:w-12 shrink-0 tabular-nums">
                  {year}
                </span>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/${item.media_type}/${item.id}`}
                    className="font-heading font-semibold text-sm sm:text-base text-white group-hover:text-primary transition-colors inline-block truncate max-w-full"
                  >
                    {title}
                  </Link>

                  {item.character && (
                    <p className="text-xs sm:text-sm text-zinc-400 truncate mt-0.5">
                      <span className="text-zinc-500">as</span> {item.character}
                      {item.episode_count ? (
                        <span className="text-zinc-500 text-xs ml-1.5">
                          ({item.episode_count} {item.episode_count === 1 ? "ep" : "eps"})
                        </span>
                      ) : null}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.vote_average > 0 && (
                  <Badge
                    variant="outline"
                    className="border-white/10 bg-black/40 text-[10px] sm:text-xs text-zinc-300 gap-1 px-1.5 py-0.5"
                  >
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span>{formatMediaRating(item.vote_average)}</span>
                  </Badge>
                )}

                <Badge
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/10 text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider px-2 py-0.5"
                >
                  {item.media_type === "movie" ? (
                    <span className="flex items-center gap-1">
                      <Film className="w-3 h-3 text-primary" />
                      <span className="hidden sm:inline">Movie</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Tv className="w-3 h-3 text-primary" />
                      <span className="hidden sm:inline">TV</span>
                    </span>
                  )}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
          Filmography
          <span className="text-xs font-normal text-zinc-400 ml-1">
            ({sortedCredits.length} credits)
          </span>
        </h2>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "all" | "movie" | "tv")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              All ({sortedCredits.length})
            </TabsTrigger>
            <TabsTrigger
              value="movie"
              className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              Movies ({movies.length})
            </TabsTrigger>
            <TabsTrigger
              value="tv"
              className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
            >
              TV ({tvShows.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "all" && renderCreditList(sortedCredits)}
      {activeTab === "movie" && renderCreditList(movies)}
      {activeTab === "tv" && renderCreditList(tvShows)}
    </div>
  );
}

