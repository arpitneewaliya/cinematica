import Image from "next/image";
import { getImageUrl } from "@/lib/tmdb";
import { CastMember } from "@/types/tmdb";

interface CastRowProps {
  cast: CastMember[];
}

export function CastRow({ cast }: CastRowProps) {
  if (!cast || cast.length === 0) return null;

  const topCast = cast.slice(0, 10);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 mb-6">
          <span className="w-1.5 h-8 bg-primary rounded-full inline-block"></span>
          Top Cast
        </h2>

        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
          {topCast.map((actor) => (
            <div key={actor.id} className="snap-start shrink-0 w-36 md:w-48 group">
              <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-white/5 border border-white/10 mb-3">
                {actor.profile_path ? (
                  <Image
                    src={getImageUrl(actor.profile_path)}
                    alt={actor.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 144px, 192px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <h4 className="font-semibold text-white text-sm md:text-base truncate">
                {actor.name}
              </h4>
              <p className="text-xs md:text-sm text-gray-400 truncate">
                {actor.character}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
