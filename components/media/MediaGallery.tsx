"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import type { TMDBImageAssetDetail, Video } from "@/types/tmdb";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface MediaGalleryProps {
  videos: Video[];
  backdrops: TMDBImageAssetDetail[];
  title: string;
}

export function MediaGallery({ videos, backdrops, title }: MediaGalleryProps) {
  const ytVideos = React.useMemo(
    () => videos.filter((v) => v.site === "YouTube").slice(0, 10),
    [videos]
  );
  const displayBackdrops = React.useMemo(
    () => backdrops.slice(0, 12),
    [backdrops]
  );

  const [activeTab, setActiveTab] = React.useState<"stills" | "videos">(() =>
    displayBackdrops.length > 0 ? "stills" : "videos"
  );
  const [stillsApi, setStillsApi] = React.useState<CarouselApi>();
  const [videosApi, setVideosApi] = React.useState<CarouselApi>();
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [activeVideo, setActiveVideo] = React.useState<Video | null>(null);

  React.useEffect(() => {
    if (lightboxIndex === null && !activeVideo) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setActiveVideo(null);
      } else if (lightboxIndex !== null && displayBackdrops.length > 0) {
        if (e.key === "ArrowRight") {
          setLightboxIndex((prev) =>
            prev === null ? null : (prev + 1) % displayBackdrops.length
          );
        } else if (e.key === "ArrowLeft") {
          setLightboxIndex((prev) =>
            prev === null
              ? null
              : (prev - 1 + displayBackdrops.length) % displayBackdrops.length
          );
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, activeVideo, displayBackdrops.length]);

  if (ytVideos.length === 0 && displayBackdrops.length === 0) {
    return null;
  }

  const effectiveTab =
    activeTab === "stills" && displayBackdrops.length > 0
      ? "stills"
      : ytVideos.length > 0
      ? "videos"
      : "stills";

  return (
    <>
      <section
        aria-labelledby="media-gallery-heading"
        className="content-visibility-auto pt-8 md:pt-12"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-0.5">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Visual Archive
              </p>
              <h2
                id="media-gallery-heading"
                className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
              >
                Videos & Stills
              </h2>
            </div>

            {displayBackdrops.length > 0 && ytVideos.length > 0 && (
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("stills")}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                    effectiveTab === "stills"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Stills ({displayBackdrops.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("videos")}
                  className={cn(
                    "rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                    effectiveTab === "videos"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  Videos ({ytVideos.length})
                </button>
              </div>
            )}
          </div>

          {effectiveTab === "stills" && displayBackdrops.length > 0 && (
            <Carousel
              setApi={setStillsApi}
              opts={{ align: "start", loop: false, slidesToScroll: 2 }}
              className="group/rail"
            >
              <CarouselContent
                viewportClassName="py-3 -my-3 px-1 -mx-1"
                className="-ml-3 md:-ml-4"
              >
                {displayBackdrops.map((img, index) => (
                  <CarouselItem
                    key={img.file_path}
                    className="basis-[82%] pl-3 sm:basis-[48%] md:pl-4 lg:basis-[32%]"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      aria-label={`Open still ${index + 1} for ${title}`}
                      className="group relative block w-full aspect-video overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1 hover:ring-white/30 hover:shadow-[0_20px_45px_-14px_rgba(0,0,0,0.9)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Image
                        src={getImageUrl(img.file_path, "w780")}
                        alt={`${title} still ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, 32vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/15" />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!stillsApi}
                onClick={() => stillsApi?.scrollPrev()}
                aria-label="Previous stills"
                className="absolute left-1 top-1/2 -translate-y-1/2 z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!stillsApi}
                onClick={() => stillsApi?.scrollNext()}
                aria-label="Next stills"
                className="absolute right-1 top-1/2 -translate-y-1/2 z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </Button>
            </Carousel>
          )}

          {effectiveTab === "videos" && ytVideos.length > 0 && (
            <Carousel
              setApi={setVideosApi}
              opts={{ align: "start", loop: false, slidesToScroll: 2 }}
              className="group/rail"
            >
              <CarouselContent
                viewportClassName="py-3 -my-3 px-1 -mx-1"
                className="-ml-3 md:-ml-4"
              >
                {ytVideos.map((video) => (
                  <CarouselItem
                    key={video.id}
                    className="basis-[82%] pl-3 sm:basis-[48%] md:pl-4 lg:basis-[32%]"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="group block w-full text-left cursor-pointer focus-visible:outline-none"
                    >
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-white/30 group-hover:shadow-[0_20px_45px_-14px_rgba(0,0,0,0.9)]">
                        {/* Using img for external YouTube thumbnail CDN */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`}
                          alt={video.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/15" />

                        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/65 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur-md">
                          {video.type}
                        </span>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex size-12 items-center justify-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md transition-transform duration-200 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                            <Play className="size-5 fill-current ml-0.5" />
                          </span>
                        </div>
                      </div>

                      <p className="mt-2 truncate px-0.5 text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-white">
                        {video.name}
                      </p>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!videosApi}
                onClick={() => videosApi?.scrollPrev()}
                aria-label="Previous videos"
                className="absolute left-1 top-[42%] -translate-y-1/2 z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!videosApi}
                onClick={() => videosApi?.scrollNext()}
                aria-label="Next videos"
                className="absolute right-1 top-[42%] -translate-y-1/2 z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </Button>
            </Carousel>
          )}
        </div>
      </section>

      {/* Stills Lightbox */}
      {lightboxIndex !== null && displayBackdrops[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/94 p-4 sm:p-8 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
            className="absolute right-5 top-5 z-20 flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          {displayBackdrops.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + displayBackdrops.length) %
                      displayBackdrops.length
                  );
                }}
                aria-label="Previous still"
                className="absolute left-3 sm:left-6 z-20 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % displayBackdrops.length);
                }}
                aria-label="Next still"
                className="absolute right-3 sm:right-6 z-20 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md hover:bg-white hover:text-black transition-colors cursor-pointer"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-6xl aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(displayBackdrops[lightboxIndex].file_path, "original")}
              alt={`${title} still ${lightboxIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/12 bg-black/70 px-3.5 py-1 text-xs font-medium text-zinc-300 tabular-nums backdrop-blur-md">
            {lightboxIndex + 1} / {displayBackdrops.length}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/94 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={activeVideo.name}
            className="relative aspect-video w-full max-w-5xl rounded-2xl border border-white/15 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video"
              className="absolute -top-12 right-0 size-10 rounded-full border-white/15 bg-white/10 text-white hover:bg-white hover:text-black cursor-pointer"
            >
              <X className="size-5" />
            </Button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${activeVideo.key}?autoplay=1`}
              title={activeVideo.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full rounded-2xl border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
