import Image from "next/image";
import Link from "next/link";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiniWatchlistButton } from "./media/MiniWatchlistButton";

interface MediaCardProps {
  item: TMDBItem;
  isSaved?: boolean;
  onToggleWatchlist?: (id: number) => void;
}

export function MediaCard({ item, isSaved = false, onToggleWatchlist }: MediaCardProps) {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  return (
    <Link href={`/${item.media_type}/${item.id}`}>
      <Card className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 cursor-pointer">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={getImageUrl(item.poster_path)}
            alt={title || "Poster"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          
          {onToggleWatchlist && (
            <MiniWatchlistButton 
              item={item} 
              isSaved={isSaved} 
              onToggle={onToggleWatchlist} 
            />
          )}

          <div className="absolute right-1.5 top-1.5 md:right-2 md:top-2">
            <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-none text-white gap-1 font-semibold text-[10px] md:text-xs">
              <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-yellow-400 text-yellow-400" />
              {item.vote_average.toFixed(1)}
            </Badge>
          </div>
        </div>
        
        <CardContent className="absolute bottom-0 w-full p-2.5 md:p-4 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="font-bold text-sm md:text-lg text-white truncate drop-shadow-md">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-gray-300 font-medium">
            {year} • {item.media_type === "movie" ? "Movie" : "TV Show"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
