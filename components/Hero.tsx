"use client";

import * as React from "react";
import Image from "next/image";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMediaTrailerAction, getWatchProvidersAction } from "@/app/actions/media";
import { Video } from "@/types/tmdb";
import { useCountry } from "@/components/providers/CountryProvider";

interface HeroProps {
  items: TMDBItem[];
}

const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  9648: "Mystery",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

function getGenreNames(genreIds?: number[], mediaType?: "movie" | "tv"): string {
  if (!genreIds || genreIds.length === 0) return "";
  const map = mediaType === "tv" ? TV_GENRES : MOVIE_GENRES;
  return genreIds
    .map((id) => map[id])
    .filter(Boolean)
    .slice(0, 2)
    .join(" • ");
}

export function Hero({ items }: HeroProps) {
  if (!items || items.length === 0) return null;

  const router = useRouter();
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [loadingTrailerId, setLoadingTrailerId] = React.useState<number | null>(null);
  const [selectedTrailer, setSelectedTrailer] = React.useState<Video | null>(null);

  const { country } = useCountry();
  const [watchProviders, setWatchProviders] = React.useState<Record<number, any>>({});
  const [loadingProviders, setLoadingProviders] = React.useState(true);

  React.useEffect(() => {
    const fetchAllProviders = async () => {
      setLoadingProviders(true);
      const results: Record<number, any> = {};
      try {
        const promises = items.map(async (item) => {
          const data = await getWatchProvidersAction(item.id, item.media_type, country);
          if (data) {
            results[item.id] = data;
          }
        });
        await Promise.all(promises);
        setWatchProviders(results);
      } catch (err) {
        console.error("Failed to fetch watch providers:", err);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchAllProviders();
  }, [items, country]);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleWatchTrailer = async (id: number, mediaType: "movie" | "tv") => {
    setLoadingTrailerId(id);
    try {
      const trailer = await getMediaTrailerAction(id, mediaType);
      if (trailer) {
        setSelectedTrailer(trailer);
      } else {
        // Fallback: navigate to details page if no trailer is found
        router.push(`/${mediaType}/${id}`);
      }
    } catch (err) {
      console.error("Failed to load trailer:", err);
      router.push(`/${mediaType}/${id}`);
    } finally {
      setLoadingTrailerId(null);
    }
  };

  return (
    <>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[650px] max-h-[900px] bg-[#0a0a0a]"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full">
          {items.map((movie, index) => {
            const title = movie.title || movie.name;
            const isActive = index === current;
            const genresString = getGenreNames(movie.genre_ids, movie.media_type);

            return (
              <CarouselItem
                key={movie.id}
                className="relative w-full h-[70vh] md:h-[85vh] min-h-[500px] md:min-h-[650px] max-h-[900px] overflow-hidden select-none"
              >
                {/* Clean backdrop image background (no blur, no silhouette cutout) */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={getImageUrl(movie.backdrop_path, "original")}
                    alt={title || "Hero background"}
                    fill
                    priority={index === 0}
                    className="object-cover transition-opacity duration-1000"
                  />

                  {/* Dark gradients to seamlessly blend into #0a0a0a and guarantee text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/75 via-[#0a0a0a]/35 to-transparent" />
                </div>

                {/* Text content & single Watch Trailer button */}
                <div className="relative h-full flex items-center container mx-auto px-6 md:px-12 z-20">
                  <div className="max-w-2xl space-y-4 md:space-y-6 text-left">
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                      className="space-y-4 md:space-y-6"
                    >
                      {/* Trending Badge */}
                      <Badge
                        variant="secondary"
                        className="bg-white/10 text-white border border-white/15 text-xs md:text-sm font-semibold tracking-wider uppercase backdrop-blur-md px-3.5 py-1 rounded-md"
                      >
                        #{index + 1} Trending
                      </Badge>

                      {/* Title */}
                      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight uppercase leading-[1.05] drop-shadow-md">
                        {title}
                      </h1>

                      {/* Metadata Line */}
                      <div className="flex flex-wrap items-center gap-2 md:gap-3.5 text-xs md:text-sm font-semibold text-gray-300">
                        <span className="flex items-center gap-1 text-blue-400">
                          <StarIcon className="w-3.5 h-3.5 fill-current" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span>
                          {new Date(
                            movie.release_date || movie.first_air_date || ""
                          ).getFullYear()}
                        </span>
                        {genresString && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span>{genresString}</span>
                          </>
                        )}
                      </div>

                      {/* Overview description */}
                      <p className="text-sm sm:text-base md:text-lg text-gray-300 line-clamp-3 leading-relaxed max-w-xl drop-shadow-md">
                        {movie.overview}
                      </p>

                      {/* Watch Providers / Streaming availability */}
                      <div className="py-1">
                        {loadingProviders ? (
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                              Streaming
                            </span>
                            <div className="flex gap-2">
                              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse border border-white/5" />
                              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse border border-white/5" />
                              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse border border-white/5" />
                            </div>
                          </div>
                        ) : (() => {
                          const providers = watchProviders[movie.id];
                          const flatrate = providers?.flatrate || [];
                          const free = providers?.free || [];
                          const rent = providers?.rent || [];
                          const buy = providers?.buy || [];
                          const streamOptions = [...free, ...flatrate];

                          if (streamOptions.length > 0) {
                            return (
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Stream On
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {streamOptions.slice(0, 5).map((provider) => (
                                    <a
                                      key={provider.provider_id}
                                      href={providers.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`${provider.provider_name} (opens JustWatch)`}
                                      className="group/logo relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 bg-black/40 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                                    >
                                      <Image
                                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        fill
                                        className="object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          } else if (rent.length > 0 || buy.length > 0) {
                            const rentBuyOptions = [...rent, ...buy]
                              .filter((v, i, a) => a.findIndex((t) => t.provider_id === v.provider_id) === i);
                            return (
                              <div className="flex flex-col gap-2">
                                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Rent/Buy On
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {rentBuyOptions.slice(0, 5).map((provider) => (
                                    <a
                                      key={provider.provider_id}
                                      href={providers.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={`${provider.provider_name} (opens JustWatch)`}
                                      className="group/logo relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 bg-black/40 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer shadow-sm"
                                    >
                                      <Image
                                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        fill
                                        className="object-cover"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                  Streaming
                                </span>
                                <a
                                  href={providers?.link || `https://www.justwatch.com`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-zinc-400 hover:text-white hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  Check JustWatch Availability
                                </a>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* Action buttons - Single Watch Trailer button */}
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Button
                          size="default"
                          disabled={loadingTrailerId === movie.id}
                          onClick={() => handleWatchTrailer(movie.id, movie.media_type)}
                          className="bg-white text-black hover:bg-white/90 gap-2 font-bold rounded-full px-6 md:px-8 py-5 md:py-6 text-sm md:text-base transition-transform hover:scale-105 shadow-md shadow-white/5 cursor-pointer disabled:opacity-80"
                        >
                          {loadingTrailerId === movie.id ? (
                            <>
                              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                              Watch Trailer
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Dynamic Trailer Player Modal Overlay */}
      {selectedTrailer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedTrailer(null)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video rounded-xl overflow-visible shadow-2xl shadow-primary/20 border border-white/10 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 sm:-top-14 sm:right-0 z-50 rounded-full w-10 h-10 border-white/10 bg-black/60 hover:bg-black text-white backdrop-blur-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => setSelectedTrailer(null)}
              aria-label="Close trailer"
            >
              <X className="w-5 h-5" />
            </Button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-xl"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
