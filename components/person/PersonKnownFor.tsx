"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TMDBItem } from "@/lib/tmdb";
import { NormalizedPersonCredit } from "@/lib/person-credits";
import { MediaCard } from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PersonKnownForProps {
  credits: NormalizedPersonCredit[];
}

export function PersonKnownFor({ credits }: PersonKnownForProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  const displayCredits = React.useMemo(
    () => credits.filter((c) => Boolean(c.posterPath)).slice(0, 18),
    [credits]
  );

  if (displayCredits.length === 0) return null;

  return (
    <section
      aria-labelledby="known-for-heading"
      className="content-visibility-auto py-6 md:py-8"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Signature Works
            </p>
            <h2
              id="known-for-heading"
              className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
            >
              Known For
            </h2>
          </div>
          <span className="hidden text-xs font-medium text-zinc-500 sm:inline tabular-nums">
            {displayCredits.length} standout{" "}
            {displayCredits.length === 1 ? "title" : "titles"}
          </span>
        </div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: displayCredits.length > 6,
            slidesToScroll: 3,
          }}
          className="group/rail"
        >
          <CarouselContent
            viewportClassName="py-3 -my-3 px-1 -mx-1"
            className="-ml-3 md:-ml-4"
          >
            {displayCredits.map((credit) => {
              const mediaItem: TMDBItem = {
                id: credit.id,
                title: credit.mediaType === "movie" ? credit.title : undefined,
                name: credit.mediaType === "tv" ? credit.title : undefined,
                overview: credit.overview,
                poster_path: credit.posterPath || "",
                backdrop_path: credit.backdropPath || "",
                release_date:
                  credit.mediaType === "movie" ? credit.releaseDate : undefined,
                first_air_date:
                  credit.mediaType === "tv" ? credit.releaseDate : undefined,
                vote_average: credit.voteAverage,
                media_type: credit.mediaType,
                genre_ids: credit.genreIds,
              };

              return (
                <CarouselItem
                  key={credit.key}
                  className="basis-[44%] pl-3 min-[520px]:basis-[32%] md:basis-[24.5%] md:pl-4 lg:basis-[19.5%] xl:basis-[16.666%]"
                >
                  <div className="space-y-1">
                    <MediaCard item={mediaItem} />
                    {credit.primaryRoleLabel && (
                      <p
                        title={credit.primaryRoleLabel}
                        className="truncate px-0.5 text-[11px] font-medium text-zinc-400"
                      >
                        {credit.primaryRoleLabel}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!api}
            onClick={() => api?.scrollPrev()}
            aria-label="Previous known for titles"
            className="absolute left-1 top-[36%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!api}
            onClick={() => api?.scrollNext()}
            aria-label="Next known for titles"
            className="absolute right-1 top-[36%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </Carousel>
      </div>
    </section>
  );
}
