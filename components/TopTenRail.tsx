"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MiniWatchlistButton } from "./media/MiniWatchlistButton";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";

interface TopTenRailProps {
  items: TMDBItem[];
  title?: string;
  eyebrow?: string;
}

export function TopTenRail({
  items,
  title = "Top 10 Today",
  eyebrow = "Daily Global Ranking",
}: TopTenRailProps) {
  const [api, setApi] = useState<CarouselApi>();
  const router = useRouter();
  const topItems = items.filter((item) => item.poster_path).slice(0, 10);

  if (topItems.length === 0) return null;

  return (
    <section
      className="content-visibility-auto py-6 md:py-8"
      aria-labelledby="top-ten-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-4 flex items-end justify-between gap-4 md:mb-5">
          <div className="space-y-0.5">
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {eyebrow}
            </p>
            <h2
              id="top-ten-heading"
              className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
            >
              {title}
            </h2>
          </div>
          <span className="hidden text-xs font-medium text-zinc-500 sm:inline">
            Updated hourly
          </span>
        </div>

        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: false, slidesToScroll: 2 }}
          className="group/rail"
        >
          <CarouselContent
            viewportClassName="py-3 -my-3 px-1 -mx-1"
            className="-ml-4 md:-ml-6"
          >
            {topItems.map((item, idx) => {
              const itemTitle = item.title || item.name || "Untitled";
              const href = `/${item.media_type}/${item.id}`;
              const { year } = getMediaReleaseInfo(
                item.release_date || item.first_air_date
              );

              return (
                <CarouselItem
                  key={`${item.media_type}-${item.id}`}
                  className="basis-[66%] pl-4 min-[480px]:basis-[48%] sm:basis-[36%] md:pl-6 lg:basis-[26%] xl:basis-[22%]"
                >
                  <Link
                    href={href}
                    prefetch={false}
                    onMouseEnter={() => router.prefetch(href)}
                    onFocus={() => router.prefetch(href)}
                    className="group flex items-end select-none focus-visible:outline-none"
                  >
                    {/* Architectural Monochrome Outlined Rank Numeral */}
                    <span
                      aria-hidden="true"
                      className="font-heading relative z-0 -mr-3 sm:-mr-4 mb-6 text-[5.25rem] sm:text-[6.5rem] font-black leading-[0.8] tracking-tighter text-transparent transition-all duration-300 [-webkit-text-stroke:1.5px_rgba(255,255,255,0.24)] group-hover:[-webkit-text-stroke:1.5px_rgba(255,255,255,0.72)] tabular-nums"
                    >
                      {idx + 1}
                    </span>

                    <div className="relative z-10 min-w-0 flex-1">
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/12 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:ring-white/30 group-hover:shadow-[0_22px_45px_-14px_rgba(0,0,0,0.9)]">
                        <Image
                          src={getImageUrl(item.poster_path, "w500")}
                          alt={itemTitle}
                          fill
                          sizes="(max-width: 640px) 44vw, (max-width: 1024px) 28vw, 18vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                        <MiniWatchlistButton item={item} />
                        {item.vote_average > 0 && (
                          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md tabular-nums md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span>{formatMediaRating(item.vote_average)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 space-y-0.5 px-0.5">
                        <h3 className="truncate font-heading text-xs sm:text-sm font-semibold text-zinc-200 transition-colors group-hover:text-white">
                          {itemTitle}
                        </h3>
                        <p className="truncate text-[11px] font-medium text-zinc-500 tabular-nums">
                          {year || "TBA"} · {item.media_type === "movie" ? "Film" : "Series"}
                        </p>
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
            aria-label="Previous Top 10 titles"
            className="absolute left-1 top-[40%] z-20 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-left-3 cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!api}
            onClick={() => api?.scrollNext()}
            aria-label="Next Top 10 titles"
            className="absolute right-1 top-[40%] z-20 hidden sm:flex size-9 rounded-full border-white/15 bg-zinc-950/85 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-black group-hover/rail:opacity-100 focus-visible:opacity-100 md:-right-3 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </Carousel>
      </div>
    </section>
  );
}
