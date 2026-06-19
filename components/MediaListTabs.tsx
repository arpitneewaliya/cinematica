"use client";

import { useState, useEffect } from "react";
import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, SlidersHorizontal, RotateCcw, Star } from "lucide-react";
import { fetchMediaChunk, fetchFilteredMedia } from "@/app/actions/media";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const MOVIE_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2000 + 1 }, (_, i) => (CURRENT_YEAR - i).toString());
const DECADES = ["1990s", "1980s", "1970s", "1960s", "1950s"];

interface MediaListTabsProps {
  title: string;
  mediaType: "movie" | "tv";
  popular: TMDBItem[];
  topRated: TMDBItem[];
  initialWatchlistIds?: number[];
}

export function MediaListTabs({ title, mediaType, popular, topRated, initialWatchlistIds = [] }: MediaListTabsProps) {
  const [activeTab, setActiveTab] = useState<"popular" | "topRated">("popular");
  
  const [popularItems, setPopularItems] = useState<TMDBItem[]>(popular);
  const [topRatedItems, setTopRatedItems] = useState<TMDBItem[]>(topRated);
  
  const [popularChunk, setPopularChunk] = useState(1);
  const [topRatedChunk, setTopRatedChunk] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistSet, setWatchlistSet] = useState<Set<number>>(new Set(initialWatchlistIds));

  // Filter UI and configuration state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Filtered list states
  const [filteredItems, setFilteredItems] = useState<TMDBItem[]>([]);
  const [filteredPage, setFilteredPage] = useState(1);
  const [isFiltering, setIsFiltering] = useState(false);
  const [hasMoreFiltered, setHasMoreFiltered] = useState(true);

  const genresList = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
  const isFilteredActive = selectedGenres.length > 0 || selectedRating > 0 || selectedYear !== "";
  const activeFiltersCount = selectedGenres.length + (selectedRating > 0 ? 1 : 0) + (selectedYear !== "" ? 1 : 0);

  // Fetch filtered media when filters or activeTab changes
  useEffect(() => {
    if (!isFilteredActive) return;

    let active = true;
    const applyFilters = async () => {
      setIsFiltering(true);
      try {
        const sortBy = activeTab === "popular" ? "popularity.desc" : "vote_average.desc";
        const results = await fetchFilteredMedia(
          mediaType,
          sortBy,
          1,
          selectedGenres,
          selectedRating,
          selectedYear
        );
        if (active) {
          setFilteredItems(results);
          setFilteredPage(1);
          setHasMoreFiltered(results.length > 0);
        }
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        if (active) {
          setIsFiltering(false);
        }
      }
    };

    applyFilters();

    return () => {
      active = false;
    };
  }, [selectedGenres, selectedRating, selectedYear, activeTab, mediaType, isFilteredActive]);

  const handleToggleGenre = (id: number) => {
    setSelectedGenres(prev => {
      const nextGenres = prev.includes(id) 
        ? prev.filter(gId => gId !== id) 
        : [...prev, id];
        
      const nextFilteredActive = nextGenres.length > 0 || selectedRating > 0 || selectedYear !== "";
      if (!nextFilteredActive) {
        setFilteredItems([]);
        setFilteredPage(1);
        setHasMoreFiltered(true);
      }
      return nextGenres;
    });
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedRating(0);
    setSelectedYear("");
    setFilteredItems([]);
    setFilteredPage(1);
    setHasMoreFiltered(true);
  };

  const handleSelectRating = (rating: number) => {
    setSelectedRating(rating);
    const nextFilteredActive = selectedGenres.length > 0 || rating > 0 || selectedYear !== "";
    if (!nextFilteredActive) {
      setFilteredItems([]);
      setFilteredPage(1);
      setHasMoreFiltered(true);
    }
  };

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
    const nextFilteredActive = selectedGenres.length > 0 || selectedRating > 0 || year !== "";
    if (!nextFilteredActive) {
      setFilteredItems([]);
      setFilteredPage(1);
      setHasMoreFiltered(true);
    }
  };

  const handleToggleWatchlist = (id: number) => {
    setWatchlistSet(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
      if (isFilteredActive) {
        const nextPage = filteredPage + 1;
        const sortBy = activeTab === "popular" ? "popularity.desc" : "vote_average.desc";
        const newItems = await fetchFilteredMedia(
          mediaType,
          sortBy,
          nextPage,
          selectedGenres,
          selectedRating,
          selectedYear
        );

        if (newItems.length === 0) {
          setHasMoreFiltered(false);
        } else {
          // Ensure no duplicates
          const existingIds = new Set(filteredItems.map(item => item.id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
          
          setFilteredItems(prev => [...prev, ...uniqueNewItems]);
          setFilteredPage(nextPage);
        }
      } else {
        if (activeTab === "popular") {
          const nextChunk = popularChunk + 1;
          const newItems = await fetchMediaChunk(mediaType, "popular", nextChunk);
          
          // Ensure no duplicates
          const existingIds = new Set(popularItems.map(item => item.id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));
          
          setPopularItems(prev => [...prev, ...uniqueNewItems]);
          setPopularChunk(nextChunk);
        } else {
          const nextChunk = topRatedChunk + 1;
          const newItems = await fetchMediaChunk(mediaType, "top_rated", nextChunk);
          
          // Ensure no duplicates
          const existingIds = new Set(topRatedItems.map(item => item.id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));

          setTopRatedItems(prev => [...prev, ...uniqueNewItems]);
          setTopRatedChunk(nextChunk);
        }
      }
    } catch (error) {
      console.error("Failed to load more items", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] w-full relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] animate-pulse">
          <Skeleton className="w-full h-full bg-white/[0.05]" />
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <SlidersHorizontal className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
      <p className="text-gray-400 max-w-sm mb-6 px-4">
        We couldn&apos;t find any {mediaType === "movie" ? "movies" : "TV shows"} that match your current filter criteria.
      </p>
      <Button onClick={handleResetFilters} variant="outline" className="rounded-full border-white/20 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 pt-20 md:pt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="w-2 h-10 bg-primary rounded-full inline-block"></span>
          {title}
        </h1>
      </div>

      <Tabs 
        defaultValue="popular" 
        className="w-full"
        onValueChange={(val) => setActiveTab(val as "popular" | "topRated")}
      >
        <div className="flex flex-row items-center justify-between mb-6 md:mb-8 flex-wrap gap-4">
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger value="popular" className="px-4 md:px-8 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">
              Popular
            </TabsTrigger>
            <TabsTrigger value="topRated" className="px-4 md:px-8 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer">
              Top Rated
            </TabsTrigger>
          </TabsList>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "default" : "outline"}
            className={cn(
              "rounded-full px-5 py-2.5 text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer",
              !showFilters ? "border-white/15 text-white/90 hover:bg-white/10 hover:text-white" : "shadow-lg shadow-primary/25"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Filter
            {activeFiltersCount > 0 && (
              <span className={cn(
                "ml-1 bg-white/20 text-white rounded-full text-[10px] md:text-xs px-2 py-0.5 font-semibold",
                showFilters && "bg-black/20 text-primary-foreground"
              )}>
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="w-full bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: `
                  .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                  }
                  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                  }
                `}} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Genres selection */}
                  <div className="lg:col-span-2">
                    <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span>Genres</span>
                      {selectedGenres.length > 0 && (
                        <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-semibold normal-case tracking-normal">
                          {selectedGenres.length} Selected
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genresList.map((genre) => {
                        const isSelected = selectedGenres.includes(genre.id);
                        return (
                          <button
                            key={genre.id}
                            onClick={() => handleToggleGenre(genre.id)}
                            className={cn(
                              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border cursor-pointer",
                              isSelected 
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]" 
                                : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/15 hover:scale-[1.03]"
                            )}
                          >
                            {genre.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating & Year Section */}
                  <div className="flex flex-col gap-6">
                    {/* Release Year & Decades */}
                    <div>
                      <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>Release Time</span>
                        {selectedYear && (
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-semibold normal-case tracking-normal">
                            Active
                          </span>
                        )}
                      </h3>
                      
                      {/* Decades list */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {DECADES.map((decade) => {
                          const isSelected = selectedYear === decade;
                          return (
                            <button
                              key={decade}
                              onClick={() => handleSelectYear(isSelected ? "" : decade)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                  : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/15 hover:scale-[1.02]"
                              )}
                            >
                              {decade}
                            </button>
                          );
                        })}
                      </div>

                      {/* Specific years grid (scrollable) */}
                      <div className="border border-white/5 rounded-xl p-3 bg-white/[0.01]">
                        <div className="text-[9px] uppercase text-white/30 tracking-wider mb-2 font-bold">Specific Years</div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-[120px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {YEARS.map((year) => {
                            const isSelected = selectedYear === year;
                            return (
                              <button
                                key={year}
                                onClick={() => handleSelectYear(isSelected ? "" : year)}
                                className={cn(
                                  "py-1.5 rounded-md text-xs font-medium border text-center transition-all duration-200 cursor-pointer",
                                  isSelected
                                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 font-semibold"
                                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/15"
                                )}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Minimum Rating */}
                    <div>
                      <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4">
                        Minimum Rating
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {[0, 8, 7, 6, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleSelectRating(rating)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all duration-200 cursor-pointer",
                              selectedRating === rating
                                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/15 hover:scale-[1.02]"
                            )}
                          >
                            {rating === 0 ? "Any" : (
                              <>
                                <Star className={cn("w-3.5 h-3.5", selectedRating === rating ? "fill-primary-foreground text-primary-foreground" : "fill-yellow-500 text-yellow-500")} />
                                {rating}.0+
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {isFilteredActive && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                    <Button
                      onClick={handleResetFilters}
                      variant="ghost"
                      className="text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-full px-4 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <TabsContent value="popular" className="mt-0 outline-none">
          {isFiltering ? (
            renderSkeletonGrid()
          ) : isFilteredActive && filteredItems.length === 0 ? (
            renderEmptyState()
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {}
              }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6"
            >
              {(isFilteredActive ? filteredItems : popularItems).map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                  }}
                >
                  <MediaCard 
                    item={item} 
                    isSaved={watchlistSet.has(item.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="topRated" className="mt-0 outline-none">
          {isFiltering ? (
            renderSkeletonGrid()
          ) : isFilteredActive && filteredItems.length === 0 ? (
            renderEmptyState()
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {}
              }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6"
            >
              {(isFilteredActive ? filteredItems : topRatedItems).map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                  }}
                >
                  <MediaCard 
                    item={item} 
                    isSaved={watchlistSet.has(item.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {(!isFilteredActive || (filteredItems.length > 0 && hasMoreFiltered)) && (
          <div className="mt-12 flex justify-center">
            <Button 
              onClick={handleLoadMore} 
              disabled={isLoading || isFiltering}
              variant="outline"
              className="px-8 py-6 rounded-full border-white/20 hover:bg-white/10 hover:text-white transition-all w-full md:w-auto cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </Tabs>
    </div>
  );
}
