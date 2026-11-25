"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TMDBItem, getImageUrl, type CountryWatchProviders } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import {
  Play,
  X,
  Star,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getMediaTrailerAction } from "@/app/actions/media";
import { Video } from "@/types/tmdb";
import { useCountry } from "@/components/providers/CountryProvider";
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";
import { cn } from "@/lib/utils";

interface HeroProps {
  items: TMDBItem[];
}

const AUTOPLAY_MS = 6500;

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
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

function getGenreNames(genreIds?: number[], mediaType?: "movie" | "tv"): string[] {
  if (!genreIds || genreIds.length === 0) return [];
  const map = mediaType === "tv" ? TV_GENRES : MOVIE_GENRES;
  return genreIds
    .map((id) => map[id])
    .filter(Boolean)
    .slice(0, 3);
}

export function Hero({ items }: HeroProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { isSaved, toggleWatchlist } = useWatchlist();
  const { country } = useCountry();

  const [current, setCurrent] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [loadingTrailerId, setLoadingTrailerId] = React.useState<number | null>(null);
  const [selectedTrailer, setSelectedTrailer] = React.useState<Video | null>(null);
  const [watchProviders, setWatchProviders] = React.useState<
    Record<string, CountryWatchProviders>
  >({});
  const touchStartX = React.useRef<number | null>(null);

  const count = items.length;

  const goTo = React.useCallback(
    (index: number) => {
      if (count === 0) return;
      setCurrent(((index % count) + count) % count);
    },
    [count]
  );

  const goNext = React.useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = React.useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay timer
  React.useEffect(() => {
    if (count <= 1 || isPaused || selectedTrailer || prefersReducedMotion) return;
    const timer = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, count, isPaused, selectedTrailer, prefersReducedMotion]);

  // Close trailer modal on Escape
  React.useEffect(() => {
    if (!selectedTrailer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTrailer(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedTrailer]);

  // Fetch streaming providers quietly in background
  React.useEffect(() => {
    let active = true;
    const fetchAllProviders = async () => {
      const results: Record<string, CountryWatchProviders> = {};
      try {
        await Promise.all(
          items.map(async (item) => {
            const res = await fetch(
              `/api/watch-providers?id=${item.id}&type=${item.media_type}&country=${encodeURIComponent(
                country
              )}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data) {
                results[`${item.media_type}:${item.id}`] = data;
              }
            }
          })
        );
        if (active) {
          setWatchProviders(results);
        }
      } catch (err) {
        console.error("Failed to fetch watch providers:", err);
      }
    };

    fetchAllProviders();
    return () => {
      active = false;
    };
  }, [items, country]);

  const handleWatchTrailer = async (id: number, mediaType: "movie" | "tv") => {
    setLoadingTrailerId(id);
    try {
      const trailer = await getMediaTrailerAction(id, mediaType);
      if (trailer) {
        setSelectedTrailer(trailer);
      } else {
        router.push(`/${mediaType}/${id}`);
      }
    } catch {
      router.push(`/${mediaType}/${id}`);
    } finally {
      setLoadingTrailerId(null);
    }
  };

  const handleToggleWatchlist = async (movie: TMDBItem) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    await toggleWatchlist({
      mediaId: movie.id,
      mediaType: movie.media_type,
      title: movie.title || movie.name || "Unknown",
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date || movie.first_air_date,
    });
  };

  if (!items || items.length === 0) return null;

  const activeMovie = items[current] || items[0];
  const activeTitle = activeMovie.title || activeMovie.name || "Featured";
  const activeGenres = getGenreNames(activeMovie.genre_ids, activeMovie.media_type);
  const activeRelease = getMediaReleaseInfo(
    activeMovie.release_date || activeMovie.first_air_date
  );
  const activeHref = `/${activeMovie.media_type}/${activeMovie.id}`;
  const activeSaved = isSaved(activeMovie.id, activeMovie.media_type);
  const logoHeight = activeMovie.logo_aspect_ratio
    ? Math.round(640 / activeMovie.logo_aspect_ratio)
    : 200;

  const providerData = watchProviders[`${activeMovie.media_type}:${activeMovie.id}`];
  const streamProviders = providerData
    ? [...(providerData.free || []), ...(providerData.flatrate || [])]
    : [];
  const rentBuyProviders = providerData
    ? [...(providerData.rent || []), ...(providerData.buy || [])].filter(
        (v, i, a) => a.findIndex((t) => t.provider_id === v.provider_id) === i
      )
    : [];
  const availableProviders = (
    streamProviders.length > 0 ? streamProviders : rentBuyProviders
  ).slice(0, 5);

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label="Featured titles"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            goPrev();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            goNext();
          }
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const deltaX = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
          if (Math.abs(deltaX) > 48) {
            if (deltaX < 0) goNext();
            else goPrev();
          }
          touchStartX.current = null;
        }}
        className="relative h-[85svh] min-h-[560px] max-h-[860px] w-full overflow-hidden bg-[#070708] select-none"
      >
        {/* Stacked Preloaded Backdrops for Zero-Flash Crossfades */}
        {items.map((item, idx) => {
          const isCurrent = idx === current;
          const itemTitle = item.title || item.name || "Featured backdrop";
          return (
            <div
              key={`${item.media_type}-${item.id}`}
              aria-hidden={!isCurrent}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                isCurrent ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
              )}
            >
              <Image
                src={getImageUrl(item.backdrop_path || item.poster_path, "original")}
                alt={itemTitle}
                fill
                priority={idx === 0}
                className={cn(
                  "object-cover object-top transition-transform duration-[7000ms] ease-out",
                  !prefersReducedMotion && isCurrent ? "scale-100" : "scale-[1.04]"
                )}
              />
            </div>
          );
        })}

        {/* Atmospheric Monochrome Vignettes */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#070708] via-[#070708]/55 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#070708]/90 via-[#070708]/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/60 to-transparent" />

        {/* Foreground Content */}
        <div className="relative z-20 container mx-auto flex h-full flex-col justify-end px-4 pb-10 sm:px-6 md:px-10 md:pb-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeMovie.media_type}-${activeMovie.id}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-4 sm:space-y-5"
                >
                  {/* Eyebrow Pill */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      <span className="size-1.5 rounded-full bg-white" />
                      #{current + 1} Trending
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-300 backdrop-blur-md">
                      {activeMovie.media_type === "movie" ? "Feature Film" : "Series"}
                    </span>
                  </div>

                  {/* Title / Official Film Logo */}
                  <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.04]">
                    <Link
                      href={activeHref}
                      className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label={`View details for ${activeTitle}`}
                    >
                      {activeMovie.logo_path ? (
                        <>
                          <span className="sr-only">{activeTitle}</span>
                          <Image
                            src={getImageUrl(activeMovie.logo_path, "original")}
                            alt=""
                            width={640}
                            height={logoHeight}
                            className="block h-auto max-h-20 w-auto max-w-[min(76vw,540px)] object-contain object-left drop-shadow-[0_8px_28px_rgba(0,0,0,0.9)] sm:max-h-28 md:max-h-36"
                          />
                        </>
                      ) : (
                        <span className="drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
                          {activeTitle}
                        </span>
                      )}
                    </Link>
                  </h1>

                  {/* Unified Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-medium text-zinc-300">
                    {activeMovie.vote_average > 0 && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-white tabular-nums">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {formatMediaRating(activeMovie.vote_average)}
                      </span>
                    )}
                    {activeRelease.year && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span className="tabular-nums text-zinc-200">
                          {activeRelease.year}
                          {activeRelease.isUpcoming ? " · Upcoming" : ""}
                        </span>
                      </>
                    )}
                    {activeGenres.length > 0 && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-300">{activeGenres.join(" · ")}</span>
                      </>
                    )}
                  </div>

                  {/* Synopsis */}
                  <p className="max-w-xl text-sm sm:text-base leading-relaxed text-zinc-300/90 line-clamp-2 sm:line-clamp-3">
                    {activeMovie.overview}
                  </p>

                  {/* Trio of Glass CTAs */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                    <Button
                      type="button"
                      disabled={loadingTrailerId === activeMovie.id}
                      onClick={() =>
                        handleWatchTrailer(activeMovie.id, activeMovie.media_type)
                      }
                      className="h-11 sm:h-12 rounded-full bg-white px-6 sm:px-7 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(255,255,255,0.18)] transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-98 cursor-pointer gap-2"
                    >
                      {loadingTrailerId === activeMovie.id ? (
                        <>
                          <span className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="size-4 fill-current" />
                          Watch Trailer
                        </>
                      )}
                    </Button>

                    <Link
                      href={activeHref}
                      className="glass-pill inline-flex h-11 sm:h-12 items-center gap-2 rounded-full px-5 sm:px-6 text-sm font-semibold text-white transition-all hover:bg-white/14 hover:border-white/25 active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>More Info</span>
                      <ArrowUpRight className="size-4 text-zinc-300" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleWatchlist(activeMovie)}
                      aria-label={
                        activeSaved ? "Remove from watchlist" : "Add to watchlist"
                      }
                      className={cn(
                        "inline-flex h-11 sm:h-12 items-center gap-2 rounded-full border px-4 sm:px-5 text-sm font-semibold backdrop-blur-xl transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                        activeSaved
                          ? "border-white bg-white/95 text-black"
                          : "border-white/14 bg-white/[0.06] text-white hover:border-white/28 hover:bg-white/14"
                      )}
                    >
                      {activeSaved ? (
                        <>
                          <Check className="size-4 stroke-[2.5]" />
                          <span className="hidden sm:inline">Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="size-4" />
                          <span className="hidden sm:inline">Watchlist</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quiet Inline Provider Icons (Zero Layout Shift) */}
                  <div className="min-h-8 flex items-center">
                    {availableProviders.length > 0 && providerData?.link && (
                      <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
                        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                          Available on
                        </span>
                        <div className="flex items-center gap-1.5">
                          {availableProviders.map((provider) => (
                            <a
                              key={provider.provider_id}
                              href={providerData.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`${provider.provider_name} (${country})`}
                              className="relative size-7 overflow-hidden rounded-lg border border-white/15 bg-black/50 transition-transform duration-200 hover:scale-110 hover:border-white/35"
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
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom-Right Interactive Slide Progress Dock */}
            {count > 1 && (
              <div className="flex items-center self-start lg:self-end">
                <div className="glass-pill flex items-center gap-1.5 rounded-full p-1.5">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous featured title"
                    className="flex size-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/12 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <div className="flex items-center gap-1.5 px-1">
                    {items.map((item, index) => {
                      const active = index === current;
                      return (
                        <button
                          key={`${item.media_type}-${item.id}`}
                          type="button"
                          onClick={() => goTo(index)}
                          aria-label={`Show slide ${index + 1}: ${item.title || item.name}`}
                          aria-current={active ? "true" : undefined}
                          className={cn(
                            "relative h-1.5 overflow-hidden rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                            active ? "w-10 bg-white/25" : "w-2 bg-white/30 hover:bg-white/60"
                          )}
                        >
                          {active && (
                            <motion.span
                              key={`${current}-${isPaused || Boolean(selectedTrailer)}`}
                              initial={{ scaleX: 0 }}
                              animate={{
                                scaleX:
                                  isPaused || selectedTrailer || prefersReducedMotion
                                    ? 0.35
                                    : 1,
                              }}
                              transition={{
                                duration:
                                  isPaused || selectedTrailer || prefersReducedMotion
                                    ? 0.2
                                    : AUTOPLAY_MS / 1000,
                                ease: "linear",
                              }}
                              className="absolute inset-0 origin-left rounded-full bg-white"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next featured title"
                    className="flex size-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/12 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trailer Player Modal */}
      {selectedTrailer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedTrailer(null)}
        >
          <div
            className="relative aspect-video w-full max-w-5xl rounded-2xl border border-white/15 bg-black shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 z-50 size-10 rounded-full border-white/15 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-black cursor-pointer"
              onClick={() => setSelectedTrailer(null)}
              aria-label="Close trailer"
            >
              <X className="size-5" />
            </Button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1`}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full rounded-2xl border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
