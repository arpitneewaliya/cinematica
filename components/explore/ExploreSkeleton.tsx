const categorySkeletons = Array.from({ length: 5 });
const genreSkeletons = Array.from({ length: 12 });
const cardSkeletons = Array.from({ length: 12 });

export function ExploreSkeleton() {
  return (
    <main className="min-h-screen bg-[#070708] pb-16" aria-label="Loading catalog">
      {/* 48svh Spotlight Skeleton */}
      <div className="relative h-[48svh] min-h-[410px] max-h-[540px] bg-[radial-gradient(circle_at_70%_28%,rgba(255,255,255,0.06),transparent_36%),linear-gradient(180deg,#0c0c0f_0%,#070708_100%)]">
        <div className="container mx-auto flex h-full flex-col justify-end px-4 pb-8 sm:px-6 md:px-8 md:pb-10">
          <div className="max-w-xl space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-28 animate-pulse rounded-full bg-white/[0.08]" />
              <div className="h-5 w-24 animate-pulse rounded-full bg-white/[0.05]" />
            </div>
            <div className="h-10 w-72 animate-pulse rounded-xl bg-white/[0.08] md:h-12" />
            <div className="h-4 w-48 animate-pulse rounded bg-white/[0.06]" />
            <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
            <div className="flex gap-2.5 pt-1">
              <div className="h-9 w-28 animate-pulse rounded-full bg-white/[0.14]" />
              <div className="h-9 w-28 animate-pulse rounded-full bg-white/[0.07]" />
              <div className="h-9 w-28 animate-pulse rounded-full bg-white/[0.07]" />
            </div>
          </div>
        </div>
      </div>

      {/* Command Bar Skeleton */}
      <div className="border-y border-white/[0.06] bg-[#070708]">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex gap-1.5 overflow-hidden">
              {categorySkeletons.map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.06]"
                />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-32 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="h-9 w-24 animate-pulse rounded-full bg-white/[0.08]" />
            </div>
          </div>
          <div className="flex gap-1.5 overflow-hidden border-t border-white/[0.05] py-2.5">
            {genreSkeletons.map((_, i) => (
              <div
                key={i}
                className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 6-Up Poster Grid Skeleton */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-5">
          {cardSkeletons.map((_, i) => (
            <div key={i} className="space-y-2.5">
              <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-white/[0.05] ring-1 ring-white/[0.06]" />
              <div className="space-y-1.5 px-0.5">
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.07]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
