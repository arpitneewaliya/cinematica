"use client";

import * as React from "react";
import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { CastMember } from "@/types/tmdb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = React.useState(false);
  const [showRightArrow, setShowRightArrow] = React.useState(false);

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
  }, [cast, checkScroll]);

  if (!cast || cast.length === 0) return null;

  const topCast = cast.slice(0, 10);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-4 md:mb-6">
          <span className="w-1.5 h-8 bg-primary rounded-full inline-block"></span>
          Top Cast
        </h2>

        <div className="relative group/arrows">
          {/* Left Arrow Button */}
          <button
            onClick={() => handleScroll("left")}
            className={cn(
              "absolute left-0 top-[35%] -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-pointer shadow-xl -translate-x-1/2 opacity-0 group-hover/arrows:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
            )}
            disabled={!showLeftArrow}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => handleScroll("right")}
            className={cn(
              "absolute right-0 top-[35%] -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-pointer shadow-xl translate-x-1/2 opacity-0 group-hover/arrows:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
            )}
            disabled={!showRightArrow}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x hide-scrollbar scroll-smooth"
          >
            {topCast.map((actor) => (
              <div key={actor.id} className="snap-start shrink-0 w-28 sm:w-36 md:w-48 group">
                <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-3">
                  {actor.profile_path ? (
                    <Image
                      src={getImageUrl(actor.profile_path)}
                      alt={actor.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 144px, 192px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <h4 className="font-semibold text-white text-sm md:text-base truncate">
                  {actor.name}
                </h4>
                <p className="text-xs md:text-sm text-gray-400 truncate">
                  {actor.character}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

