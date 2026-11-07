"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { TMDBItem } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MediaCard } from "./MediaCard";

interface MediaRailProps {
  title: string;
  items: TMDBItem[];
  initialWatchlistIds?: number[];
  eyebrow?: string;
  className?: string;
}

export function MediaRail({
  title,
  items,
  initialWatchlistIds = [],
  eyebrow = "Discover",
  className,
}: MediaRailProps) {
  const [watchlistSet, setWatchlistSet] = useState<Set<number>>(
    () => new Set(initialWatchlistIds)
  );
  const [api, setApi] = useState<CarouselApi>();
  const displayItems = items.filter((item) => item.poster_path).slice(0, 10);

  if (displayItems.length === 0) return null;

  const handleToggleWatchlist = (id: number) => {
    setWatchlistSet((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className={cn("content-visibility-auto py-5 md:py-7", className)} aria-labelledby={`${title}-heading`}>
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-3 flex items-end justify-between gap-4 md:mb-4">
          <div>
            <p className="font-heading mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/80">
              <Sparkles className="size-3" aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 id={`${title}-heading`} className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
              {title}
            </h2>
          </div>
          <span className="hidden text-xs font-medium text-zinc-500 sm:block">{displayItems.length} picks</span>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true, slidesToScroll: 4 }}
          className="group/rail"
        >
          <CarouselContent className="-ml-2.5 md:-ml-3">
            {displayItems.map((item) => (
              <CarouselItem
                key={`${item.media_type}-${item.id}`}
                className="basis-[72%] pl-2.5 min-[480px]:basis-[46%] sm:basis-[31%] md:basis-1/4 md:pl-3"
              >
                <MediaCard
                  item={item}
                  isSaved={watchlistSet.has(item.id)}
                  onToggleWatchlist={handleToggleWatchlist}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            disabled={!api}
            onClick={() => api?.scrollPrev()}
            aria-label={`Previous ${title} titles`}
            className="absolute left-1 top-[42%] z-10 size-9 border-white/15 bg-black/75 text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-4"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            disabled={!api}
            onClick={() => api?.scrollNext()}
            aria-label={`Next ${title} titles`}
            className="absolute right-1 top-[42%] z-10 size-9 border-white/15 bg-black/75 text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-4"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </Button>
        </Carousel>
      </div>
    </section>
  );
}
