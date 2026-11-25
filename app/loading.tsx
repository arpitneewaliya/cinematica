const skeletonRows = Array.from({ length: 3 });
const skeletonCards = Array.from({ length: 6 });
const skeletonPills = Array.from({ length: 10 });

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[#070708] pb-14" aria-label="Loading Cinematica">
      {/* 85svh Hero Skeleton */}
      <div className="h-[85svh] min-h-[560px] max-h-[860px] bg-[radial-gradient(circle_at_70%_28%,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,#0c0c0f_0%,#070708_100%)]">
        <div className="container mx-auto flex h-full flex-col justify-end px-4 pb-10 sm:px-6 md:px-10 md:pb-14">
          <div className="w-full max-w-xl space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-28 animate-pulse rounded-full bg-white/[0.08]" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-white/[0.05]" />
            </div>
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-white/[0.08] md:h-16" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.07]" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-white/[0.05]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/[0.05]" />
            </div>
            <div className="flex gap-3 pt-1">
              <div className="h-11 w-38 animate-pulse rounded-full bg-white/[0.14]" />
              <div className="h-11 w-32 animate-pulse rounded-full bg-white/[0.07]" />
              <div className="h-11 w-28 animate-pulse rounded-full bg-white/[0.07]" />
            </div>
          </div>
        </div>
      </div>

      {/* Genre Pill Bar Skeleton */}
      <div className="border-b border-white/[0.06] py-3.5">
        <div className="container mx-auto flex gap-2 overflow-hidden px-4 sm:px-6 md:px-8">
          {skeletonPills.map((_, i) => (
            <div
              key={i}
              className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-white/[0.05]"
            />
          ))}
        </div>
      </div>

      {/* 6-Up Unobstructed Rail Skeletons */}
      <div className="pt-4">
        {skeletonRows.map((_, rowIndex) => (
          <section key={rowIndex} className="py-5 md:py-7">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-4 space-y-1.5">
                <div className="h-2.5 w-24 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-6 w-48 animate-pulse rounded bg-white/[0.09]" />
              </div>
              <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
                {skeletonCards.map((_, cardIndex) => (
                  <div key={cardIndex} className="space-y-2.5">
                    <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-white/[0.05] ring-1 ring-white/[0.06]" />
                    <div className="space-y-1.5 px-0.5">
                      <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.07]" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
