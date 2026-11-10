"use client";

import * as React from "react";
import Image from "next/image";
import { PersonProfileImage } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { ChevronLeft, ChevronRight, X, ZoomIn, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonPhotosProps {
  images: PersonProfileImage[];
  name: string;
}

const PHOTO_BATCH_SIZE = 20;

export function PersonPhotos({ images, name }: PersonPhotosProps) {
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(() =>
    Math.min(PHOTO_BATCH_SIZE, images.length)
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

  const displayImages = React.useMemo(() => {
    return images.slice(0, visibleCount);
  }, [images, visibleCount]);

  const hasMoreImages = visibleCount < images.length;

  const checkScroll = React.useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll, { passive: true });
      const timeoutId = setTimeout(checkScroll, 100);

      const resizeObserver = new ResizeObserver(() => {
        checkScroll();
      });
      resizeObserver.observe(container);

      return () => {
        container.removeEventListener("scroll", checkScroll);
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [displayImages, checkScroll]);

  // Keyboard navigation for Lightbox
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

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [lightboxIndex, displayImages.length]);

  if (displayImages.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const currentImage = lightboxIndex !== null ? displayImages[lightboxIndex] : null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
          Photos
          <span className="text-xs font-normal text-zinc-400 ml-1">
            (Showing {displayImages.length} of {images.length})
          </span>
        </h2>
      </div>

      <div className="relative group/photo-arrows">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll("left")}
          className={cn(
            "absolute left-0 top-[50%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/75 border border-white/10 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-pointer shadow-xl -translate-x-3 opacity-0 group-hover/photo-arrows:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
          )}
          disabled={!showLeftArrow}
          aria-label="Scroll photos left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll("right")}
          className={cn(
            "absolute right-0 top-[50%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/75 border border-white/10 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-pointer shadow-xl translate-x-3 opacity-0 group-hover/photo-arrows:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
          )}
          disabled={!showRightArrow}
          aria-label="Scroll photos right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Photos Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3.5 md:gap-4 pb-4 snap-x hide-scrollbar scroll-smooth"
        >
          {displayImages.map((img, index) => (
            <div
              key={img.file_path}
              onClick={() => setLightboxIndex(index)}
              className="snap-start shrink-0 w-32 sm:w-40 md:w-44 cursor-pointer group/photo relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
            >
              <Image
                src={getImageUrl(img.file_path, "w500")}
                alt={`${name} photo ${index + 1}`}
                fill
                sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
                className="object-cover transition-transform duration-500 group-hover/photo:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                <span className="text-[11px] font-semibold text-white bg-black/60 border border-white/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-md">
                  <ZoomIn className="w-3 h-3 text-primary" />
                  View
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasMoreImages && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((currentCount) =>
                Math.min(currentCount + PHOTO_BATCH_SIZE, images.length)
              )
            }
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-primary/60 hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
          >
            Load 20 more photos
          </button>
        </div>
      )}

      {/* Fullscreen Interactive Lightbox Modal */}
      {lightboxIndex !== null && currentImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6 md:p-8 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Header controls inside lightbox */}
          <div
            className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-md text-xs sm:text-sm font-medium">
              <Camera className="w-4 h-4 text-primary" />
              <span>
                {lightboxIndex + 1} / {displayImages.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/60 border border-white/15 text-white hover:bg-white hover:text-black backdrop-blur-md transition-all duration-200 cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null ? (prev === 0 ? displayImages.length - 1 : prev - 1) : null
              );
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 border border-white/15 text-white hover:bg-primary hover:text-black hover:border-primary backdrop-blur-md transition-all duration-200 cursor-pointer shadow-2xl"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image Container */}
          <div
            className="relative w-full max-w-xl md:max-w-2xl h-[75vh] max-h-[820px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getImageUrl(currentImage.file_path, "original")}
              alt={`${name} photo preview`}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 90vw, 672px"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev !== null ? (prev === displayImages.length - 1 ? 0 : prev + 1) : null
              );
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 border border-white/15 text-white hover:bg-primary hover:text-black hover:border-primary backdrop-blur-md transition-all duration-200 cursor-pointer shadow-2xl"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}

