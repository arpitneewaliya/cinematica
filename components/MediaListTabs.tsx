"use client";

import { useState } from "react";
import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchMediaChunk } from "@/app/actions/media";

interface MediaListTabsProps {
  title: string;
  mediaType: "movie" | "tv";
  popular: TMDBItem[];
  topRated: TMDBItem[];
}

export function MediaListTabs({ title, mediaType, popular, topRated }: MediaListTabsProps) {
  const [activeTab, setActiveTab] = useState<"popular" | "topRated">("popular");
  
  const [popularItems, setPopularItems] = useState<TMDBItem[]>(popular);
  const [topRatedItems, setTopRatedItems] = useState<TMDBItem[]>(topRated);
  
  const [popularChunk, setPopularChunk] = useState(1);
  const [topRatedChunk, setTopRatedChunk] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    setIsLoading(true);
    try {
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
        // TMDB uses 'top_rated' for the endpoint category, which our server action expects
        const newItems = await fetchMediaChunk(mediaType, "top_rated", nextChunk);
        
        // Ensure no duplicates
        const existingIds = new Set(topRatedItems.map(item => item.id));
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.id));

        setTopRatedItems(prev => [...prev, ...uniqueNewItems]);
        setTopRatedChunk(nextChunk);
      }
    } catch (error) {
      console.error("Failed to load more items", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        <TabsList className="mb-6 md:mb-8 bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="popular" className="px-4 md:px-8 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Popular
          </TabsTrigger>
          <TabsTrigger value="topRated" className="px-4 md:px-8 text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Top Rated
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="popular" className="mt-0 outline-none">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
              hidden: {}
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6"
          >
            {popularItems.map((item, index) => (
              <motion.div
                // Use a combination of id and index for key to handle potential API duplicates gracefully
                key={`${item.id}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                }}
              >
                <MediaCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="topRated" className="mt-0 outline-none">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
              hidden: {}
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6"
          >
            {topRatedItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                }}
              >
                <MediaCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <div className="mt-12 flex justify-center">
          <Button 
            onClick={handleLoadMore} 
            disabled={isLoading}
            variant="outline"
            className="px-8 py-6 rounded-full border-white/20 hover:bg-white/10 hover:text-white transition-all w-full md:w-auto"
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
      </Tabs>
    </div>
  );
}
