"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface HeroProps {
  items: TMDBItem[];
}

export function Hero({ items }: HeroProps) {
  if (!items || items.length === 0) return null;

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full h-[80vh] min-h-[600px] max-h-[900px]"
      opts={{ loop: true }}
    >
      <CarouselContent className="h-full">
        {items.map((movie, index) => {
          const title = movie.title || movie.name;
          return (
            <CarouselItem key={movie.id} className="relative w-full h-[80vh] min-h-[600px] max-h-[900px]">
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={getImageUrl(movie.backdrop_path, 'original')}
                  alt={title || "Hero background"}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-end pb-20 container mx-auto px-4 md:px-8 z-10">
                <div className="max-w-3xl space-y-6">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-sm font-semibold tracking-wider uppercase backdrop-blur-md">
                    #{index + 1} Trending
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-xl tracking-tight">
                    {title}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-sm md:text-base font-medium text-gray-300 drop-shadow-md">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <StarIcon className="w-4 h-4 fill-current" />
                      {movie.vote_average.toFixed(1)} Rating
                    </span>
                    <span>•</span>
                    <span>{new Date(movie.release_date || movie.first_air_date || '').getFullYear()}</span>
                    <span>•</span>
                    <span className="uppercase">{movie.media_type}</span>
                  </div>

                  <p className="text-lg md:text-xl text-gray-200 line-clamp-3 md:line-clamp-4 drop-shadow-lg leading-relaxed max-w-2xl">
                    {movie.overview}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Link href={`/${movie.media_type}/${movie.id}`}>
                      <Button size="lg" className="bg-white text-black hover:bg-white/90 gap-2 font-semibold rounded-full px-8 transition-transform hover:scale-105">
                        <Play className="w-5 h-5 fill-current" />
                        More Info
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
