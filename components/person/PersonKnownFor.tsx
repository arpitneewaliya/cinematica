"use client";

import * as React from "react";
import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonKnownForProps {
  items: TMDBItem[];
}

export function PersonKnownFor({ items }: PersonKnownForProps) {
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
  }, [items, checkScroll]);

  if (!items || items.length === 0) return null;

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

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
          Known For
        </h2>
      </div>

      <div className="relative group/known-arrows">
        {/* Left Arrow Button */}
        <button
          onClick={() => handleScroll("left")}
          className={cn(
            "absolute left-0 top-[45%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/75 border border-white/10 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-pointer shadow-xl -translate-x-3 opacity-0 group-hover/known-arrows:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
          )}
          disabled={!showLeftArrow}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={() => handleScroll("right")}
          className={cn(
            "absolute right-0 top-[45%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full bg-black/75 border border-white/10 text-white backdrop-blur-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 cursor-pointer shadow-xl translate-x-3 opacity-0 group-hover/known-arrows:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
          )}
          disabled={!showRightArrow}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3.5 md:gap-4 pb-4 snap-x hide-scrollbar scroll-smooth"
        >
          {items.map((item) => (
            <div
              key={`${item.media_type}-${item.id}`}
              className="snap-start shrink-0 w-36 sm:w-44 md:w-48"
            >
              <MediaCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

