"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Star, Film, Tv, Loader2 } from "lucide-react";
import { TMDBItem } from "@/lib/tmdb";
import { searchMediaAction } from "@/app/actions/media";
import { getImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<TMDBItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setActiveIndex(-1);
      }, 0);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Debounced search logic
  React.useEffect(() => {
    if (!query.trim()) {
      setTimeout(() => {
        setResults([]);
        setIsLoading(false);
      }, 0);
      return;
    }
    setTimeout(() => {
      setIsLoading(true);
    }, 0);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const searchResults = await searchMediaAction(query);
        setResults(searchResults.slice(0, 8)); // Limit to top 8 items for command palette look
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        setActiveIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Handle arrow keys and navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev < results.length - 1 ? prev + 1 : prev;
          scrollActiveItemIntoView(next);
          return next;
        });
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : -1;
          scrollActiveItemIntoView(next);
          return next;
        });
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          const selectedItem = results[activeIndex];
          onClose();
          router.push(`/${selectedItem.media_type}/${selectedItem.id}`);
        } else if (query.trim()) {
          onClose();
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex, results, query, router, onClose]);

  const scrollActiveItemIntoView = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elements = container.querySelectorAll("[data-search-item]");
      const activeEl = elements[index] as HTMLElement;

      if (activeEl) {
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const elemTop = activeEl.offsetTop;
        const elemBottom = elemTop + activeEl.clientHeight;

        if (elemTop < containerTop) {
          container.scrollTop = elemTop;
        } else if (elemBottom > containerBottom) {
          container.scrollTop = elemBottom - container.clientHeight;
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-start pt-[10vh] md:pt-[15vh]">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl mx-4 bg-zinc-950/95 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[70vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Input Header */}
        <div className="relative border-b border-white/5 flex items-center">
          <div className="absolute left-4 pointer-events-none text-zinc-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full bg-transparent h-16 pl-12 pr-12 text-white placeholder-zinc-500 focus:outline-none text-base md:text-lg"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="absolute right-12 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <div className="absolute right-4 text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded pointer-events-none">
            ESC
          </div>
        </div>

        {/* Results Body */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-2 min-h-[150px] max-h-[50vh] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Fetching results...</p>
            </div>
          )}

          {!isLoading && !query.trim() && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
              <Search className="w-8 h-8 opacity-40" />
              <p className="text-sm font-medium">Type to search movies and TV shows</p>
              <p className="text-xs opacity-60">Press Enter for full search</p>
            </div>
          )}

          {!isLoading && query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
              <X className="w-8 h-8 opacity-40" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs opacity-60">Try searching for something else or press Enter to run a full search</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Matching Suggestions
              </div>
              {results.map((item, idx) => {
                const year = item.release_date 
                  ? new Date(item.release_date).getFullYear() 
                  : item.first_air_date 
                  ? new Date(item.first_air_date).getFullYear()
                  : "";
                
                const isItemActive = idx === activeIndex;

                return (
                  <Link
                    key={item.id}
                    href={`/${item.media_type}/${item.id}`}
                    onClick={onClose}
                    data-search-item
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-xl transition-all duration-150 cursor-pointer border border-transparent",
                      isItemActive 
                        ? "bg-white/10 border-white/5 scale-[1.01] shadow-[0_4px_20px_rgba(0,0,0,0.3)]" 
                        : "hover:bg-white/5 hover:border-white/5"
                    )}
                  >
                    {/* Small Poster */}
                    <div className="relative w-10 h-14 bg-zinc-900 rounded-md overflow-hidden shrink-0 border border-white/5">
                      {item.poster_path ? (
                        <Image
                          src={getImageUrl(item.poster_path, "w500")}
                          alt={item.title || item.name || ""}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-600">
                          {item.media_type === "movie" ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {item.title || item.name}
                        </span>
                        {year && (
                          <span className="text-xs text-zinc-500 font-medium shrink-0">
                            {year}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {item.overview || "No overview description available."}
                      </p>
                    </div>

                    {/* Badge & Rating */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-[9px] uppercase tracking-wider px-1.5 py-0 border-none rounded-full",
                          item.media_type === "movie" 
                            ? "bg-indigo-500/10 text-indigo-400" 
                            : "bg-teal-500/10 text-teal-400"
                        )}
                      >
                        {item.media_type === "movie" ? "Movie" : "TV"}
                      </Badge>
                      {item.vote_average > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          {item.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="bg-zinc-900/50 border-t border-white/5 px-4 py-3 flex justify-between items-center text-[10px] text-zinc-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700 font-mono">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700 font-mono">Enter</kbd> to select
            </span>
          </div>
          <div>
            Press <kbd className="bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700 font-mono">Enter</kbd> for full search page
          </div>
        </div>
      </div>
    </div>
  );
}
