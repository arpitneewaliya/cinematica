"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/tmdb";
import { CastMember } from "@/types/tmdb";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  if (!cast || cast.length === 0) return null;

  const topCast = cast.slice(0, 30);

  return (
    <section
      aria-labelledby="top-cast-heading"
      className="content-visibility-auto pt-8 md:pt-12 pb-2"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="space-y-0.5">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              The Ensemble
            </p>
            <h2
              id="top-cast-heading"
              className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
            >
              Top Cast
            </h2>
          </div>
          <span className="hidden text-xs font-medium text-zinc-500 sm:inline tabular-nums">
            {topCast.length} credited
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
            {topCast.map((actor) => {
              const profileUrl = getImageUrl(actor.profile_path, "w342");
              return (
                <CarouselItem
                  key={actor.id}
                  className="basis-[38%] pl-3 min-[480px]:basis-[28%] sm:basis-[22%] md:basis-[17.5%] md:pl-4 lg:basis-[14.5%] xl:basis-[12.5%]"
                >
                  <Link
                    href={`/person/${actor.id}`}
                    className="group block select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:ring-white/25 group-hover:shadow-[0_18px_40px_-14px_rgba(0,0,0,0.88)]">
                      {profileUrl ? (
                        <Image
                          src={profileUrl}
                          alt={actor.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 34vw, (max-width: 1024px) 18vw, 14vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600">
                          <User className="size-8 stroke-[1.4]" />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" />
                    </div>

                    <div className="mt-2.5 space-y-0.5 px-0.5">
                      <h3 className="truncate font-heading text-xs sm:text-sm font-semibold text-zinc-200 transition-colors group-hover:text-white">
                        {actor.name}
                      </h3>
                      {actor.character && (
                        <p className="truncate text-[11px] sm:text-xs text-zinc-500">
                          {actor.character}
                        </p>
                      )}
                    </div>
                  </Link>
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
            aria-label="Previous cast members"
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
            aria-label="Next cast members"
            className="absolute right-1 top-[36%] z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </Carousel>
      </div>
    </section>
  );
}
