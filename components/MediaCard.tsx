import Image from "next/image";
import { TMDBItem, getImageUrl } from "@/lib/tmdb";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MediaCard({ item }: { item: TMDBItem }) {
  const title = item.title || item.name;
  const releaseDate = item.release_date || item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  return (
    <Card className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={getImageUrl(item.poster_path)}
          alt={title || "Poster"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        
        <div className="absolute right-2 top-2">
          <Badge variant="secondary" className="bg-black/60 backdrop-blur-md border-none text-white gap-1 font-semibold">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {item.vote_average.toFixed(1)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="absolute bottom-0 w-full p-4 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
        <h3 className="font-bold text-lg text-white truncate drop-shadow-md">
          {title}
        </h3>
        <p className="text-sm text-gray-300 font-medium">
          {year} • {item.media_type === "movie" ? "Movie" : "TV Show"}
        </p>
      </CardContent>
    </Card>
  );
}
