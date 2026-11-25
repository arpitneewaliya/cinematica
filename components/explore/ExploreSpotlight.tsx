"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { ExploreMediaType, getGenreMap } from "@/lib/explore-config";
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
import { useWatchlist } from "@/components/providers/WatchlistProvider";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatMediaRating, getMediaReleaseInfo } from "@/lib/media-display";
import { cn } from "@/lib/utils";

interface ExploreSpotlightProps {
  items: TMDBItem[];
  mediaType: ExploreMediaType;
}

const AUTOPLAY_MS = 7000;

export function ExploreSpotlight({ items, mediaType }: ExploreSpotlightProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { isSaved, toggleWatchlist } = useWatchlist();

  const [current, setCurrent] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [loadingTrailerId, setLoadingTrailerId] = React.useState<number | null>(null);
  const [selectedTrailer, setSelectedTrailer] = React.useState<Video | null>(null);

  const count = items.length;
  const genreMap = React.useMemo(() => getGenreMap(mediaType), [mediaType]);

  const goTo = React.useCallback(
    (index: number) => {
      if (count === 0) return;
      setCurrent(((index % count) + count) % count);
    },
    [count]
  );

  const goNext = React.useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = React.useCallback(() => goTo(current - 1), [current, goTo]);

  React.useEffect(() => {
    if (count <= 1 || isPaused || selectedTrailer || prefersReducedMotion) return;
    const timer = window.setTimeout(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, count, isPaused, selectedTrailer, prefersReducedMotion]);

  React.useEffect(() => {
    if (!selectedTrailer) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTrailer(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedTrailer]);

  const handleWatchTrailer = async (id: number) => {
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

  const handleToggleWatchlist = async (item: TMDBItem) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    await toggleWatchlist({
      mediaId: item.id,
      mediaType: item.media_type,
      title: item.title || item.name || "Unknown",
      posterPath: item.poster_path,
      backdropPath: item.backdrop_path,
      releaseDate: item.release_date || item.first_air_date,
    });
  };

  if (!items || items.length === 0) {
    return (
      <section className="relative flex h-44 items-end border-b border-white/[0.06] bg-[#070708] pt-24 pb-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            {mediaType === "movie" ? "Explore Cinema" : "Explore Television"}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {mediaType === "movie" ? "Movies" : "TV Series"}
          </h1>
        </div>
      </section>
    );
  }

  const active = items[current] || items[0];
  const activeTitle = active.title || active.name || "Featured";
  const activeHref = `/${mediaType}/${active.id}`;
  const activeSaved = isSaved(active.id, mediaType);
  const releaseInfo = getMediaReleaseInfo(active.release_date || active.first_air_date);
  const activeGenres = (active.genre_ids || [])
    .map((id) => genreMap[id])
    .filter(Boolean)
    .slice(0, 3);
  const logoHeight = active.logo_aspect_ratio
    ? Math.round(520 / active.logo_aspect_ratio)
    : 160;

  return (
    <>
      <section
        aria-roledescription="carousel"
        aria-label={
          mediaType === "movie" ? "Featured movies spotlight" : "Featured series spotlight"
        }
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative h-[48svh] min-h-[410px] max-h-[540px] w-full overflow-hidden bg-[#070708] select-none"
      >
        {/* Preloaded crossfade backdrops */}
        {items.map((item, idx) => {
          const isCurrent = idx === current;
          const itemTitle = item.title || item.name || "Featured backdrop";
          return (
            <div
              key={`${item.media_type}-${item.id}`}
              aria-hidden={!isCurrent}
              className={cn(
                "absolute inset-0 transition-opacity duration-900 ease-out",
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
                  !prefersReducedMotion && isCurrent ? "scale-100" : "scale-[1.03]"
                )}
              />
            </div>
          );
        })}

        {/* Atmospheric #070708 vignettes */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#070708] via-[#070708]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#070708]/92 via-[#070708]/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/65 to-transparent" />

        {/* Foreground Editorial Info */}
        <div className="relative z-20 container mx-auto flex h-full flex-col justify-end px-4 pb-8 sm:px-6 md:px-8 md:pb-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.media_type}-${active.id}`}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3"
                >
                  {/* Eyebrow */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      <span className="size-1.5 rounded-full bg-white" />
                      {mediaType === "movie" ? "Explore Cinema" : "Explore Series"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-300 backdrop-blur-md">
                      #{current + 1} Trending
                    </span>
                  </div>

                  {/* Logo or Title */}
                  <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-[1.05]">
                    <Link
                      href={activeHref}
                      className="inline-block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      aria-label={`View details for ${activeTitle}`}
                    >
                      {active.logo_path ? (
                        <>
                          <span className="sr-only">{activeTitle}</span>
                          <Image
                            src={getImageUrl(active.logo_path, "original")}
                            alt=""
                            width={520}
                            height={logoHeight}
                            className="block h-auto max-h-14 w-auto max-w-[min(70vw,400px)] object-contain object-left drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] sm:max-h-20 md:max-h-24"
                          />
                        </>
                      ) : (
                        <span className="drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]">
                          {activeTitle}
                        </span>
                      )}
                    </Link>
                  </h1>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-zinc-300">
                    {active.vote_average > 0 && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-white tabular-nums">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {formatMediaRating(active.vote_average)}
                      </span>
                    )}
                    {releaseInfo.year && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span className="tabular-nums text-zinc-200">{releaseInfo.year}</span>
                      </>
                    )}
                    {activeGenres.length > 0 && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-300">{activeGenres.join(" · ")}</span>
                      </>
                    )}
                  </div>

                  {/* Concise Synopsis */}
                  {active.overview && (
                    <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-300/90 line-clamp-2">
                      {active.overview}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <Button
                      type="button"
                      disabled={loadingTrailerId === active.id}
                      onClick={() => handleWatchTrailer(active.id)}
                      className="h-9 sm:h-10 rounded-full bg-white px-5 text-xs sm:text-sm font-semibold text-black shadow-[0_6px_24px_rgba(255,255,255,0.16)] transition-all hover:bg-zinc-200 active:scale-95 cursor-pointer gap-2"
                    >
                      {loadingTrailerId === active.id ? (
                        <>
                          <span className="size-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5 fill-current" />
                          Trailer
                        </>
                      )}
                    </Button>

                    <Link
                      href={activeHref}
                      className="glass-pill inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-full px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/14 hover:border-white/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <span>More Info</span>
                      <ArrowUpRight className="size-3.5 text-zinc-300" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleToggleWatchlist(active)}
                      aria-label={activeSaved ? "Remove from watchlist" : "Add to watchlist"}
                      className={cn(
                        "inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-full border px-4 text-xs sm:text-sm font-semibold backdrop-blur-xl transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                        activeSaved
                          ? "border-white bg-white text-black"
                          : "border-white/14 bg-white/[0.06] text-white hover:border-white/28 hover:bg-white/14"
                      )}
                    >
                      {activeSaved ? (
                        <>
                          <Check className="size-3.5 stroke-[2.5]" />
                          <span className="hidden sm:inline">Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="size-3.5" />
                          <span className="hidden sm:inline">Watchlist</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Switcher Dock */}
            {count > 1 && (
              <div className="flex items-center self-start lg:self-end">
                <div className="glass-pill flex items-center gap-1 rounded-full p-1">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous spotlight title"
                    className="flex size-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/12 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 px-1">
                    {items.map((item, index) => {
                      const isCurrent = index === current;
                      return (
                        <button
                          key={`${item.media_type}-${item.id}`}
                          type="button"
                          onClick={() => goTo(index)}
                          aria-label={`Show slide ${index + 1}: ${item.title || item.name}`}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                            isCurrent
                              ? "w-7 bg-white"
                              : "w-1.5 bg-white/30 hover:bg-white/60"
                          )}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next spotlight title"
                    className="flex size-7 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/12 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
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
