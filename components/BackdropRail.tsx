"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MiniWatchlistButton } from "./media/MiniWatchlistButton";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";

interface BackdropRailProps {
  title: string;
  eyebrow?: string;
  items: TMDBItem[];
  exploreHref?: string;
  className?: string;
}

export function BackdropRail({
  title,
  eyebrow,
  items,
  exploreHref,
  className,
}: BackdropRailProps) {
  const [api, setApi] = useState<CarouselApi>();
  const router = useRouter();
  const displayItems = items
    .filter((item) => item.backdrop_path || item.poster_path)
    .slice(0, 14);

  if (displayItems.length === 0) return null;

  const headingId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-backdrop-heading`;

  return (
    <section
      className={cn("content-visibility-auto py-6 md:py-9", className)}
      aria-labelledby={headingId}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
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

          {exploreHref && (
            <Link
              href={exploreHref}
              className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-xs font-medium text-zinc-400 transition-all hover:border-white/12 hover:bg-white/[0.05] hover:text-white"
            >
              <span>Explore All</span>
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: displayItems.length > 3, slidesToScroll: 2 }}
          className="group/rail"
        >
          <CarouselContent
            viewportClassName="py-3 -my-3 px-1 -mx-1"
            className="-ml-3.5 md:-ml-5"
          >
            {displayItems.map((item) => {
              const itemTitle = item.title || item.name || "Untitled";
              const href = `/${item.media_type}/${item.id}`;
              const { year, isUpcoming } = getMediaReleaseInfo(
                item.release_date || item.first_air_date
              );
              const imagePath = item.backdrop_path || item.poster_path;

              return (
                <CarouselItem
                  key={`${item.media_type}-${item.id}`}
                  className="basis-[86%] pl-3.5 sm:basis-[56%] md:pl-5 lg:basis-[37%] xl:basis-[32%]"
                >
                  <Link
                    href={href}
                    prefetch={false}
                    onMouseEnter={() => router.prefetch(href)}
                    onFocus={() => router.prefetch(href)}
                    className="group block select-none rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/12 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:ring-white/28 group-hover:shadow-[0_24px_50px_-14px_rgba(0,0,0,0.9)]">
                      <Image
                        src={getImageUrl(imagePath, "w780")}
                        alt={itemTitle}
                        fill
                        sizes="(max-width: 640px) 86vw, (max-width: 1024px) 56vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" />

                      <MiniWatchlistButton item={item} className="top-3 left-3" />

                      {item.vote_average > 0 && (
                        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md tabular-nums">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span>{formatMediaRating(item.vote_average)}</span>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400 tabular-nums">
                          <span>{item.media_type === "movie" ? "Film" : "Series"}</span>
                          {year && (
                            <>
                              <span>·</span>
                              <span>
                                {year}
                                {isUpcoming ? " · Upcoming" : ""}
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="truncate font-heading text-base sm:text-lg font-bold tracking-tight text-white">
                          {itemTitle}
                        </h3>
                        {item.overview && (
                          <p className="mt-1 line-clamp-1 text-xs text-zinc-300/85">
                            {item.overview}
                          </p>
                        )}
                      </div>
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
            aria-label={`Previous ${title} titles`}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!api}
            onClick={() => api?.scrollNext()}
            aria-label={`Next ${title} titles`}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </Carousel>
      </div>
    </section>
  );
}
