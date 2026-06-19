"use client";

import * as React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WatchlistButton } from "./WatchlistButton";
import { WatchedButton } from "./WatchedButton";
import { AddToCustomListButton } from "./AddToCustomListButton";
import { TrailerModal } from "./TrailerModal";
import { Star, Clock, Calendar, ChevronDown, ChevronUp, VolumeX, Volume2, Play, Pause } from "lucide-react";
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

  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Reset states in render phase when media item id changes
  const [prevId, setPrevId] = React.useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setIsExpanded(false);
    setIsVideoLoaded(false);
    setIsMuted(true);
    setIsPlaying(true);
  }

  const toggleMute = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isMuted ? "unMute" : "mute";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command }),
        "*"
      );
      setIsMuted(!isMuted);
    }
  };

  const togglePlay = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? "pauseVideo" : "playVideo";
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: command }),
        "*"
      );
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoLoad = () => {
    // A small delay lets the YouTube iframe settle to prevent visual flashes
    setTimeout(() => {
      setIsVideoLoaded(true);
    }, 500);
  };

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
    <div className="relative w-full h-auto min-h-[80vh] md:min-h-[85vh] flex flex-col md:flex-row items-center justify-center pt-[20vh] md:pt-[35vh] pb-8 md:pb-16 px-4 md:px-8">
      {/* Background Media & Ambient Video Preview */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
        {/* Static Backdrop Image (visible when trailer is not loaded or playing) */}
        {backdropPath && (
          <Image
            src={getImageUrl(backdropPath, "original")}
            alt={title}
            fill
            priority
            className={cn(
              "object-cover transition-opacity duration-1000 ease-in-out z-0",
              (isVideoLoaded && isPlaying) ? "opacity-0" : "opacity-50"
            )}
          />
        )}

        {/* Muted background preview loop */}
        {trailer && (
          <div className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out z-10 scale-[1.25]", // scale by 25% to crop YouTube top/bottom player UI overlay
            (isVideoLoaded && isPlaying) ? "opacity-[0.80]" : "opacity-0"
          )}>
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&enablejsapi=1&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
              title="Preview Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full pointer-events-none"
              onLoad={handleVideoLoad}
            ></iframe>
          </div>
        )}

        {/* z-20 overlays to blend it into the dark background and guarantee text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-20" />
      </div>

      <div className="container relative z-30 mx-auto flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end">
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
      {trailer && isVideoLoaded && (
        <div className="absolute right-4 md:right-8 bottom-4 md:bottom-8 z-30 flex items-center gap-3 animate-in fade-in duration-500">
          <Button
            size="icon"
            variant="outline"
            onClick={togglePlay}
            className="rounded-full w-10 h-10 md:w-12 md:h-12 border-white/10 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
            aria-label={isPlaying ? "Pause trailer" : "Play trailer"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current text-primary" />
            )}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={toggleMute}
            className="rounded-full w-10 h-10 md:w-12 md:h-12 border-white/10 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
            aria-label={isMuted ? "Unmute preview" : "Mute preview"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5 text-primary" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

