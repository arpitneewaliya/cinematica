"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  ZoomIn,
} from "lucide-react";
import { PersonProfileImage } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PersonPhotosProps {
  images: PersonProfileImage[];
  name: string;
}

const emptySubscribe = () => () => {};

export function PersonPhotos({ images, name }: PersonPhotosProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const displayImages = React.useMemo(() => images.slice(0, 24), [images]);

  React.useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? displayImages.length - 1 : prev - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === displayImages.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, displayImages.length]);

  if (displayImages.length === 0) return null;

  const currentImage =
    lightboxIndex !== null ? displayImages[lightboxIndex] : null;

  return (
    <>
      <section
        aria-labelledby="person-photos-heading"
        className="content-visibility-auto py-6 md:py-8"
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div className="space-y-0.5">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Portraits &amp; Press
              </p>
              <h2
                id="person-photos-heading"
                className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
              >
                Photos
              </h2>
            </div>
            <span className="text-xs font-medium text-zinc-500 tabular-nums">
              {displayImages.length}
              {images.length > displayImages.length
                ? ` of ${images.length}`
                : ""}{" "}
              {displayImages.length === 1 ? "portrait" : "portraits"}
            </span>
          </div>

          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: false, slidesToScroll: 3 }}
            className="group/rail"
          >
            <CarouselContent
              viewportClassName="py-3 -my-3 px-1 -mx-1"
              className="-ml-3 md:-ml-4"
            >
              {displayImages.map((img, index) => (
                <CarouselItem
                  key={img.file_path}
                  className="basis-[42%] pl-3 min-[520px]:basis-[30%] md:basis-[22%] md:pl-4 lg:basis-[16.666%]"
                >
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`Open portrait ${index + 1} of ${name}`}
                    className="group relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:ring-white/25 hover:shadow-[0_22px_45px_-14px_rgba(0,0,0,0.88)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Image
                      src={getImageUrl(img.file_path, "w500")}
                      alt={`${name} portrait ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 42vw, (max-width: 1024px) 22vw, 17vw"
                      className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/75 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                        <ZoomIn className="size-3" />
                        View
                      </span>
                    </div>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>

            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!api}
              onClick={() => api?.scrollPrev()}
              aria-label="Previous portraits"
              className="absolute left-1 top-[42%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!api}
              onClick={() => api?.scrollNext()}
              aria-label="Next portraits"
              className="absolute right-1 top-[42%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </Button>
          </Carousel>
        </div>
      </section>

      {/* Portal Fullscreen Lightbox */}
      {isMounted &&
        lightboxIndex !== null &&
        currentImage &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} portrait preview`}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Toolbar */}
            <div
              className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white tabular-nums">
                  <Camera className="size-3.5 text-zinc-300" />
                  {lightboxIndex + 1} / {displayImages.length}
                </span>
                {currentImage.width > 0 && currentImage.height > 0 && (
                  <span className="hidden sm:inline-flex rounded-full border border-white/12 bg-black/60 px-3 py-1.5 font-mono text-[11px] text-zinc-300 backdrop-blur-md">
                    {currentImage.width} × {currentImage.height}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getImageUrl(currentImage.file_path, "original")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close lightbox"
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Previous */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null
                    ? prev === 0
                      ? displayImages.length - 1
                      : prev - 1
                    : null
                );
              }}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Portrait Container */}
            <div
              className="relative h-[78vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-zinc-950 shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={getImageUrl(currentImage.file_path, "original")}
                alt={`${name} portrait ${lightboxIndex + 1}`}
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 92vw, 672px"
              />
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null
                    ? prev === displayImages.length - 1
                      ? 0
                      : prev + 1
                    : null
                );
              }}
              aria-label="Next photo"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
