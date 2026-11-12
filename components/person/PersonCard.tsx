import Image from "next/image";
import Link from "next/link";
import { PersonSearchResult } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PersonCardProps {
  person: PersonSearchResult;
}

export function PersonCard({ person }: PersonCardProps) {
  const knownForTitles = person.known_for
    ?.map((item) => item.title || item.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ");

  return (
    <Link href={`/person/${person.id}`} prefetch={false} className="block h-full">
      <Card className="group relative h-full overflow-hidden rounded-xl bg-card/50 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 cursor-pointer flex flex-col">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
          {person.profile_path ? (
            <Image
              src={getImageUrl(person.profile_path)}
              alt={person.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 480px) 72vw, (max-width: 640px) 46vw, (max-width: 768px) 31vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-1.5">
              <User className="w-12 h-12 stroke-1" />
              <span className="text-[11px]">No Photo</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          {person.known_for_department && (
            <div className="absolute right-1.5 top-1.5 md:right-2 md:top-2">
              <Badge
                variant="secondary"
                className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] md:text-xs font-medium"
              >
                {person.known_for_department}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 md:p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm md:text-base text-white tracking-tight truncate group-hover:text-primary transition-colors">
              {person.name}
            </h3>

            {knownForTitles && (
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                <span className="text-zinc-500">Known for:</span> {knownForTitles}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

