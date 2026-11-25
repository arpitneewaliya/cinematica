import Image from "next/image";
import Link from "next/link";
import { PersonSearchResult } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { User } from "lucide-react";

interface PersonCardProps {
  person: PersonSearchResult;
}

export function PersonCard({ person }: PersonCardProps) {
  const knownForTitles = person.known_for
    ?.map((item) => item.title || item.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(" · ");

  const profileUrl = getImageUrl(person.profile_path, "w500");

  return (
    <Link
      href={`/person/${person.id}`}
      prefetch={false}
      className="group block select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#070708]"
    >
      {/* Unobstructed 2:3 Portrait Frame */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-900/90 ring-1 ring-white/10 transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:ring-white/25 group-hover:shadow-[0_22px_45px_-14px_rgba(0,0,0,0.88)]">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={person.name}
            fill
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 480px) 46vw, (max-width: 768px) 31vw, (max-width: 1024px) 23vw, 17vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-zinc-900 text-zinc-600">
            <User className="size-10 stroke-[1.4]" />
            <span className="px-3 text-center text-xs font-medium text-zinc-500 line-clamp-2">
              {person.name}
            </span>
          </div>
        )}

        {/* Top gradient & subtle specular border */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 via-black/15 to-transparent opacity-70 transition-opacity duration-300" />
        <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" />

        {person.known_for_department && (
          <span className="pointer-events-none absolute right-2 top-2 rounded-full border border-white/15 bg-black/65 px-2.5 py-0.5 text-[10px] font-medium text-zinc-100 backdrop-blur-md">
            {person.known_for_department}
          </span>
        )}
      </div>

      {/* Crisp Editorial Caption Below */}
      <div className="mt-2.5 space-y-0.5 px-0.5">
        <h3 className="truncate font-heading text-[13px] sm:text-sm font-semibold tracking-tight text-zinc-200 transition-colors duration-200 group-hover:text-white">
          {person.name}
        </h3>
        <p className="truncate text-[11px] sm:text-xs font-medium text-zinc-500">
          {knownForTitles || person.known_for_department || "Talent"}
        </p>
      </div>
    </Link>
  );
}
