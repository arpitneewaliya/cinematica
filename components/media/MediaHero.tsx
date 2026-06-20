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
import { Star, Clock, Calendar, VolumeX, Volume2, Play, Pause } from "lucide-react";
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

  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false);
  const [isUserActive, setIsUserActive] = React.useState(true);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (!isVideoLoaded || !isPlaying) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setIsUserActive(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsUserActive(false);
      }, 3000);
    };

    // Initial timeout trigger
    timeoutId = setTimeout(() => {
      setIsUserActive(false);
    }, 3000);

    const events = ["mousemove", "mousedown", "scroll", "keydown", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isPlaying, isVideoLoaded]);

  const shouldHideDetails = isVideoLoaded && isPlaying && !isUserActive;

  // Reset states in render phase when media item id changes
  const [prevId, setPrevId] = React.useState(id);
  if (id !== prevId) {
    setPrevId(id);
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

  return (
    <>
      {/* Part 1: Ambient Video/Backdrop Banner */}
      <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[500px] md:min-h-[600px] flex items-end pb-12 px-4 md:px-8">
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
                (isVideoLoaded && isPlaying) ? "opacity-0" : "opacity-80"
              )}
            />
          )}

          {/* Muted background preview loop */}
          {trailer && (
            <div className={cn(
              "absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-1000 ease-in-out z-10 pointer-events-none scale-[1.35] md:scale-[1.25]",
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

          {/* overlays to blend it into the dark background and guarantee text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent z-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-20" />
        </div>

        <div className="container relative z-30 mx-auto px-4 md:px-8 w-full">
          {/* Minimal Hero overlay (Title + metadata) */}
          <div className={cn(
            "flex flex-col gap-4 max-w-3xl text-left transition-all duration-700 ease-in-out origin-bottom",
            shouldHideDetails 
              ? "opacity-0 translate-y-4 pointer-events-none select-none" 
              : "opacity-100 translate-y-0"
          )}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] tracking-tight leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center justify-start gap-2 md:gap-4 text-xs md:text-sm font-semibold text-gray-200">
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 border-none gap-1 py-0.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                {rating.toFixed(1)}
              </Badge>
              {year && (
                <span className="flex items-center gap-1 drop-shadow-md">
                  <Calendar className="w-4 h-4" /> {year}
                </span>
              )}
              {runtime ? (
                <span className="flex items-center gap-1 drop-shadow-md">
                  <Clock className="w-4 h-4" /> {Math.floor(runtime / 60)}h {runtime % 60}m
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-start gap-2 mt-1">
              {genres.map((g) => (
                <Badge key={g.id} variant="outline" className="border-white/20 text-gray-200 backdrop-blur-md bg-black/20">
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Ambient controls */}
        {trailer && isVideoLoaded && (
          <div className={cn(
            "absolute right-4 md:right-8 bottom-12 z-30 flex items-center gap-3 animate-in fade-in duration-500 transition-all duration-700 ease-in-out",
            shouldHideDetails ? "opacity-0 pointer-events-none translate-y-2 select-none" : "opacity-100 translate-y-0"
          )}>
            <Button
              size="icon"
              variant="outline"
              onClick={togglePlay}
              className="rounded-full w-10 h-10 md:w-12 md:h-12 border-white/10 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105 animate-in zoom-in-50 duration-300"
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
              className="rounded-full w-10 h-10 md:w-12 md:h-12 border-white/10 bg-black/40 hover:bg-black/60 text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105 animate-in zoom-in-50 duration-300"
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

      {/* Part 2: Details & Actions Section (Below the fold) */}
      <div className="w-full bg-[#0a0a0a] border-t border-white/5 relative z-30 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Poster Column */}
          {posterPath && (
            <div className="relative shrink-0 w-48 h-72 sm:w-56 sm:h-84 md:w-72 md:h-[27rem] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <Image
                src={getImageUrl(posterPath, "w500")}
                alt={title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          {/* Details & Info Column */}
          <div className="flex-1 text-left flex flex-col gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Synopsis</h2>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed max-w-4xl">
                {overview || "No synopsis available."}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-start gap-3 md:gap-4 pt-4 w-full sm:w-auto">
              {trailer && (
                <TrailerModal 
                  video={trailer} 
                  className="col-span-2 sm:col-span-auto w-full sm:w-auto h-11 md:h-12 text-sm md:text-base"
                />
              )}
              <WatchlistButton
                mediaId={id}
                mediaType={type}
                title={title}
                posterPath={posterPath}
                backdropPath={backdropPath}
                releaseDate={releaseDate}
                initialIsSaved={isSaved}
                className="w-full sm:w-auto h-11 md:h-12 text-sm md:text-base"
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
                className="w-full sm:w-auto h-11 md:h-12 text-sm md:text-base"
              />
              <AddToCustomListButton
                mediaId={id}
                mediaType={type}
                title={title}
                posterPath={posterPath}
                backdropPath={backdropPath}
                releaseDate={releaseDate}
                className="col-span-2 sm:col-span-auto w-full sm:w-auto h-11 md:h-12 text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

