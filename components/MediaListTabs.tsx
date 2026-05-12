"use client";

import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaListTabsProps {
  title: string;
  popular: TMDBItem[];
  topRated: TMDBItem[];
}

export function MediaListTabs({ title, popular, topRated }: MediaListTabsProps) {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 pt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          <span className="w-2 h-10 bg-primary rounded-full inline-block"></span>
          {title}
        </h1>
      </div>

      <Tabs defaultValue="popular" className="w-full">
        <TabsList className="mb-8 bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="popular" className="px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Popular
          </TabsTrigger>
          <TabsTrigger value="topRated" className="px-8 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Top Rated
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="popular" className="mt-0 outline-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {popular.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="topRated" className="mt-0 outline-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {topRated.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
