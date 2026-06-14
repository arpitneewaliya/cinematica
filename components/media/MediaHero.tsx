"use client";

import * as React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "./WatchlistButton";
import { WatchedButton } from "./WatchedButton";
import { AddToCustomListButton } from "./AddToCustomListButton";
import { TrailerModal } from "./TrailerModal";
import { Star, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Video } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MediaHeroProps {
  id: number;
  type: "movie" | "tv";
  title: string;
  overview: string;
  backdropPath: string | null;
  posterPath: string | null;
  rating: number;
  releaseDate: string | null;
  runtime?: number | null;
  genres: { id: number; name: string }[];
  videos: Video[];
  isSaved: boolean;
  initialWatchCount?: number;
  initialLastRating?: number | null;
}

export function MediaHero({
  id,
  type,
  title,
  overview,
  backdropPath,
  posterPath,
  rating,
  releaseDate,
  runtime,
  genres,
  videos,
  isSaved,
  initialWatchCount = 0,
  initialLastRating = null,
}: MediaHeroProps) {
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
  const trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube") || videos[0];

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCollapsible, setIsCollapsible] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  // Reset expansion state when switching items
  React.useEffect(() => {
    setIsExpanded(false);
  }, [id]);

  const checkCollapsible = React.useCallback(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      if (window.innerWidth < 768) {
        setIsCollapsible(scrollHeight > clientHeight);
      } else {
        setIsCollapsible(false);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!isExpanded) {
      checkCollapsible();
      const timeoutId = setTimeout(checkCollapsible, 100);
      window.addEventListener("resize", checkCollapsible);
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", checkCollapsible);
      };
    }
  }, [overview, isExpanded, checkCollapsible]);

  return (
    <div className="relative w-full h-auto min-h-[60vh] md:min-h-[70vh] flex flex-col md:flex-row items-center justify-center pt-20 md:pt-24 pb-8 md:pb-12 px-4 md:px-8">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {backdropPath && (
          <Image
            src={getImageUrl(backdropPath, "original")}
            alt={title}
            fill
            priority
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
        {/* Poster */}
        {posterPath && (
          <div className="relative w-44 h-64 sm:w-56 sm:h-80 md:w-80 md:h-[30rem] shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <Image
              src={getImageUrl(posterPath, "w500")}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Details */}
        <div className="flex flex-col gap-6 max-w-3xl text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg tracking-tight">
            {title}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 text-xs md:text-base font-medium text-gray-300">
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none gap-1">
              <Star className="w-4 h-4 fill-current" />
              {rating.toFixed(1)}
            </Badge>
            {year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {year}
              </span>
            )}
            {runtime ? (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {Math.floor(runtime / 60)}h {runtime % 60}m
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {genres.map((g) => (
              <Badge key={g.id} variant="outline" className="border-white/20 text-gray-300 backdrop-blur-md">
                {g.name}
              </Badge>
            ))}
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Overview</h3>
            <p
              ref={textRef}
              className={cn(
                "text-sm md:text-lg text-gray-300 leading-relaxed transition-all duration-300",
                isExpanded ? "line-clamp-none" : "line-clamp-4 md:line-clamp-none"
              )}
            >
              {overview}
            </p>
            {isCollapsible && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-xs font-semibold text-gray-300 hover:text-white flex items-center gap-1 mx-auto md:hidden transition-colors cursor-pointer py-1.5 px-3.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 shadow-lg"
                aria-label={isExpanded ? "Collapse overview" : "Expand overview"}
              >
                {isExpanded ? (
                  <>
                    Read Less <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Read More <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
            {trailer && <TrailerModal video={trailer} />}
            <WatchlistButton
              mediaId={id}
              mediaType={type}
              title={title}
              posterPath={posterPath}
              backdropPath={backdropPath}
              releaseDate={releaseDate}
              initialIsSaved={isSaved}
            />
            <WatchedButton
              mediaId={id}
              mediaType={type}
              title={title}
              posterPath={posterPath}
              backdropPath={backdropPath}
              releaseDate={releaseDate}
              runtime={runtime}
              initialWatchCount={initialWatchCount}
              initialLastRating={initialLastRating}
            />
            <AddToCustomListButton
              mediaId={id}
              mediaType={type}
              title={title}
              posterPath={posterPath}
              backdropPath={backdropPath}
              releaseDate={releaseDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

