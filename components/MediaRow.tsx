import { TMDBItem } from "@/lib/tmdb";
import { MediaCard } from "./MediaCard";

interface MediaRowProps {
  title: string;
  items: TMDBItem[];
}

export function MediaRow({ title, items }: MediaRowProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-4 md:py-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-1.5 h-8 bg-primary rounded-full inline-block"></span>
            {title}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
