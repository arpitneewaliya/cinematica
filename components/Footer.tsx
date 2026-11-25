import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-[#050506] text-zinc-400">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="flex size-6 items-center justify-center rounded-full border border-white/20 bg-white/[0.08]">
                <span className="size-2 rounded-full bg-white" />
              </span>
              <span className="font-heading text-lg font-extrabold tracking-tight text-white">
                Cinematica
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
              A minimal space to discover cinema and television, log your watch history, and curate personal collections.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <div className="space-y-3">
              <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Explore
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-zinc-500 transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/movies" className="text-zinc-500 transition-colors hover:text-white">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/tv" className="text-zinc-500 transition-colors hover:text-white">
                    TV Series
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movies?tab=topRated"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Critically Acclaimed
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Genres
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/movies?genre=878"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Science Fiction
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movies?genre=18"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Drama
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movies?genre=53"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Thriller
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movies?genre=16"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Animation
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Library
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/watchlist"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Watchlist
                  </Link>
                </li>
                <li>
                  <Link
                    href="/watched"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Watched History
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lists"
                    className="text-zinc-500 transition-colors hover:text-white"
                  >
                    Custom Lists
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center">
          <p>© {year} Cinematica. Crafted for film lovers.</p>
          <p>Film metadata and artwork courtesy of TMDb.</p>
        </div>
      </div>
    </footer>
  );
}
