export function MediaDetailSkeleton() {
  return (
    <main
      className="min-h-screen bg-[#070708] pb-16"
      aria-label="Loading title details"
    >
      {/* Unified Above-the-Fold Editorial Stage Skeleton */}
      <section className="relative min-h-[72svh] pt-28 pb-12 md:pt-36 md:pb-16 flex items-end bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.06),transparent_36%),linear-gradient(180deg,#0c0c0f_0%,#070708_100%)]">
        <div className="container mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex flex-col md:flex-row gap-7 md:gap-10 lg:gap-12 items-start md:items-end">
            <div className="w-40 sm:w-48 md:w-60 lg:w-68 shrink-0 aspect-[2/3] rounded-2xl bg-white/[0.06] ring-1 ring-white/10 animate-pulse" />

            <div className="flex-1 w-full max-w-3xl space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-white/[0.08] animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-white/[0.05] animate-pulse" />
              </div>
              <div className="h-11 sm:h-14 w-3/4 rounded-xl bg-white/[0.09] animate-pulse" />
              <div className="h-4 w-56 rounded bg-white/[0.06] animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-20 rounded-full bg-white/[0.05] animate-pulse" />
                <div className="h-7 w-24 rounded-full bg-white/[0.05] animate-pulse" />
                <div className="h-7 w-18 rounded-full bg-white/[0.05] animate-pulse" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full rounded bg-white/[0.05] animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-white/[0.05] animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-white/[0.05] animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2.5 pt-2">
                <div className="h-11 w-38 rounded-full bg-white/[0.14] animate-pulse" />
                <div className="h-11 w-32 rounded-full bg-white/[0.07] animate-pulse" />
                <div className="h-11 w-32 rounded-full bg-white/[0.07] animate-pulse" />
                <div className="h-11 w-28 rounded-full bg-white/[0.07] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Watch + Facts Grid Skeleton */}
      <section className="container mx-auto px-4 sm:px-6 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-48 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-pulse" />
          <div className="lg:col-span-7 h-48 rounded-2xl bg-white/[0.03] border border-white/[0.08] animate-pulse" />
        </div>
      </section>

      {/* Cast Row Skeleton */}
      <section className="container mx-auto px-4 sm:px-6 md:px-10 py-6">
        <div className="mb-4 space-y-1.5">
          <div className="h-2.5 w-24 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-6 w-36 rounded bg-white/[0.09] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] rounded-xl bg-white/[0.05] animate-pulse" />
              <div className="h-3.5 w-4/5 rounded bg-white/[0.07] animate-pulse" />
              <div className="h-3 w-3/5 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
