"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Calendar, Trash2, Video, Film, BarChart3, AlertCircle, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { removeFromWatchedHistory } from "@/app/actions/watched";
import { getImageUrl } from "@/lib/tmdb";

interface WatchedItem {
  id: string;
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  runtime: number | null;
  watchedAt: Date;
  rating: number | null;
  notes: string | null;
}

interface HistoryFeedProps {
  initialItems: WatchedItem[];
  stats: {
    totalCount: number;
    totalRuntime: number;
    averageRating: number;
    ratingCounts: Record<number, number>;
    monthlyData: { month: string; count: number }[];
  };
}

export function HistoryFeed({ initialItems, stats }: HistoryFeedProps) {
  const [items, setItems] = useState<WatchedItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this watch log?")) {
      return;
    }

    startTransition(async () => {
      // Optimistic update
      setItems((prev) => prev.filter((item) => item.id !== id));
      const res = await removeFromWatchedHistory(id);
      if (!res.success) {
        // Revert on failure
        alert(res.error || "Failed to remove item");
        window.location.reload();
      }
    });
  };

  // Convert runtime minutes to readable format
  const formatRuntime = (totalMins: number) => {
    const days = Math.floor(totalMins / (24 * 60));
    const hours = Math.floor((totalMins % (24 * 60)) / 60);
    const minutes = totalMins % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  };

  // Find maximum monthly watch count to scale charts
  const maxMonthlyCount = Math.max(...stats.monthlyData.map((d) => d.count), 1);
  const maxRatingCount = Math.max(...Object.values(stats.ratingCounts), 1);

  return (
    <div className="space-y-12">
      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Watches</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-1.5">{items.length}</h3>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 font-medium">
                <Video className="w-3.5 h-3.5" /> Movies & TV Shows logged
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all duration-300">
              <Film className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time Spent</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-1.5">{formatRuntime(stats.totalRuntime)}</h3>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" /> Total watch duration
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300">
              <Clock className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Rating</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-1.5">
                {stats.averageRating > 0 ? `${stats.averageRating}` : "—"}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 font-medium">
                <Star className="w-3.5 h-3.5 fill-yellow-500/10 text-yellow-500" /> Based on your ratings
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-yellow-500/30 transition-all duration-300">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {items.length > 0 && (
        /* Charts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Rating Distribution Bar Chart */}
          <Card className="bg-zinc-900/20 border-white/5 backdrop-blur-md p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" /> Rating Distribution
            </h3>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingCounts[rating] || 0;
                const percentage = (count / maxRatingCount) * 100;
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="w-12 text-sm text-gray-400 font-bold flex items-center gap-1">
                      {rating} <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    </div>
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500/80 to-yellow-500 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-8 text-right text-xs font-bold text-gray-300">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Monthly Watch Activity Chart */}
          <Card className="bg-zinc-900/20 border-white/5 backdrop-blur-md p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Monthly Watch Activity ({new Date().getFullYear()})
            </h3>
            <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-white/10 px-2">
              {stats.monthlyData.map((data, idx) => {
                const heightPercentage = (data.count / maxMonthlyCount) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-zinc-950 border border-white/10 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                      {data.count} watches
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-primary/60 to-primary rounded-t group-hover:to-primary/80 transition-all duration-700 min-h-[4px]"
                      style={{ height: `${heightPercentage}%` }}
                    />
                    <span className="text-[10px] text-gray-500 font-semibold mt-2 select-none group-hover:text-white transition-colors">
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Watch Timeline */}
      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
          Watch History Feed
        </h3>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
              <Sparkles className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No watch logs yet</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Mark a movie or TV show as watched to start tracking your watch history.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const watchedDate = new Date(item.watchedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : "";

              return (
                <div
                  key={item.id}
                  className="group relative flex gap-4 md:gap-6 p-4 bg-zinc-900/20 border border-white/5 rounded-2xl hover:bg-zinc-900/40 hover:border-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  {/* Poster Link */}
                  <Link
                    href={`/${item.mediaType}/${item.mediaId}`}
                    className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 shadow-lg shadow-black/40 hover:scale-[1.03] transition-all"
                  >
                    {item.posterPath ? (
                      <Image
                        src={getImageUrl(item.posterPath)}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                        N/A
                      </div>
                    )}
                  </Link>

                  {/* Log Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <Link 
                          href={`/${item.mediaType}/${item.mediaId}`}
                          className="font-bold text-white text-base md:text-lg hover:text-primary hover:underline transition-all truncate pr-4"
                        >
                          {item.title}
                        </Link>
                        {releaseYear && (
                          <span className="text-xs font-semibold text-gray-500 select-none">
                            ({releaseYear})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 select-none">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 capitalize px-2 py-0 h-auto text-[10px] md:text-xs">
                          {item.mediaType === "movie" ? "Movie" : "TV Show"}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-500" />
                          Logged on {watchedDate}
                        </span>
                        {item.rating && (
                          <div className="flex items-center gap-0.5 ml-1 text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (item.rating || 0)
                                    ? "fill-yellow-500"
                                    : "text-zinc-700"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.notes && (
                      <div className="mt-3 text-xs md:text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed relative pr-8">
                        "{item.notes}"
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <div className="shrink-0 flex items-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors active:scale-95"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
