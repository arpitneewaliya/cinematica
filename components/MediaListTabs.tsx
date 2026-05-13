"use client";

import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface MediaListTabsProps {
  title: string;
  popular: TMDBItem[];
  topRated: TMDBItem[];
}

export function MediaListTabs({ title, popular, topRated }: MediaListTabsProps) {
  return (
    <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 pt-20 md:pt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="w-2 h-10 bg-primary rounded-full inline-block"></span>
          {title}
        </h1>
      </div>

      <Tabs defaultValue="popular" className="w-full">
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
            {popular.map((item) => (
              <motion.div
                key={item.id}
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
            {topRated.map((item) => (
              <motion.div
                key={item.id}
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
      </Tabs>
    </div>
  );
}
