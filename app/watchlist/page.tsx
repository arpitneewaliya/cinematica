import { getUserWatchlist } from "@/app/actions/watchlist";
import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "My Watchlist - Cinematica",
};

export default async function WatchlistPage() {
  const items = await getUserWatchlist();

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-6 md:mb-8 flex items-center gap-3">
          <span className="w-2 h-10 bg-primary rounded-full inline-block"></span>
          My Watchlist
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Star className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground max-w-md">
              Start saving movies and shows to watch later. They will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {items.map((item) => {
              const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : "";
              return (
                <Link key={item.id} href={`/${item.mediaType}/${item.mediaId}`}>
                  <Card className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-white/5">
                      {item.posterPath && (
                        <Image
                          src={getImageUrl(item.posterPath)}
                          alt={item.title || "Poster"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                    </div>
                    
                    <CardContent className="absolute bottom-0 w-full p-2.5 md:p-4 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                      <h3 className="font-bold text-sm md:text-lg text-white truncate drop-shadow-md">
                        {item.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-300 font-medium capitalize">
                        {year} • {item.mediaType}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
