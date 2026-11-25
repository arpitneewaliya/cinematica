import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

const QUICK_PILLS = [
  { label: "Critically Acclaimed", href: "/movies?tab=topRated" },
  { label: "Sci-Fi", href: "/movies?genre=878" },
  { label: "Action", href: "/movies?genre=28" },
  { label: "Thriller", href: "/movies?genre=53" },
  { label: "Drama", href: "/movies?genre=18" },
  { label: "Horror", href: "/movies?genre=27" },
  { label: "Comedy", href: "/movies?genre=35" },
  { label: "Animation", href: "/movies?genre=16" },
  { label: "Crime", href: "/movies?genre=80" },
  { label: "Mystery", href: "/movies?genre=9648" },
  { label: "Fantasy", href: "/movies?genre=14" },
  { label: "Acclaimed Series", href: "/tv?tab=topRated" },
  { label: "Sci-Fi & Fantasy TV", href: "/tv?genre=10765" },
];

export function GenrePillBar() {
  return (
    <nav
      aria-label="Quick category filters"
      className="border-b border-white/[0.06] bg-[#070708]/90 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-3.5">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 pr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            <SlidersHorizontal className="size-3.5" />
            Browse
          </span>
          {QUICK_PILLS.map((pill) => (
            <Link
              key={pill.label}
              href={pill.href}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.11] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
