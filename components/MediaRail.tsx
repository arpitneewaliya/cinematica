"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
  eyebrow?: string;
  exploreHref?: string;
  exploreLabel?: string;
  className?: string;
}

export function MediaRail({
  title,
  items,
  eyebrow,
  exploreHref,
  exploreLabel = "Explore All",
  className,
}: MediaRailProps) {
  const [api, setApi] = useState<CarouselApi>();
  const displayItems = items.filter((item) => item.poster_path).slice(0, 18);

  if (displayItems.length === 0) return null;

  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;

  return (
    <section
      className={cn("content-visibility-auto py-5 md:py-7", className)}
      aria-labelledby={headingId}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-3.5 flex items-end justify-between gap-4 md:mb-4">
          <div className="space-y-0.5">
            {eyebrow && (
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {eyebrow}
              </p>
            )}
            <h2
              id={headingId}
              className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
            >
              {title}
            </h2>
          </div>

          {exploreHref ? (
            <Link
              href={exploreHref}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-xs font-medium text-zinc-400 transition-all hover:border-white/12 hover:bg-white/[0.05] hover:text-white"
            >
              <span>{exploreLabel}</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: displayItems.length > 6, slidesToScroll: 3 }}
          className="group/rail"
        >
          <CarouselContent
            viewportClassName="py-3 -my-3 px-1 -mx-1"
            className="-ml-3 md:-ml-4"
          >
            {displayItems.map((item) => (
              <CarouselItem
                key={`${item.media_type}-${item.id}`}
                className="basis-[44%] pl-3 min-[520px]:basis-[32%] md:basis-[24.5%] md:pl-4 lg:basis-[19.5%] xl:basis-[16.666%]"
              >
                <MediaCard item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!api}
            onClick={() => api?.scrollPrev()}
            aria-label={`Previous ${title} titles`}
            className="absolute left-1 top-[38%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!api}
            onClick={() => api?.scrollNext()}
            aria-label={`Next ${title} titles`}
            className="absolute right-1 top-[38%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </Carousel>
      </div>
    </section>
  );
}
