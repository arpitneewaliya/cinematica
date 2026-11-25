export function PersonDetailSkeleton() {
  return (
    <main
      className="min-h-screen bg-[#070708] pb-16"
      aria-label="Loading person profile"
    >
      {/* Hero Stage Skeleton */}
      <section className="relative flex min-h-[64svh] items-end pt-28 pb-10 md:pt-36 md:pb-14 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.06),transparent_42%),linear-gradient(180deg,#0c0c0f_0%,#070708_100%)]">
        <div className="container mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex flex-col items-start gap-7 md:flex-row md:items-end md:gap-10 lg:gap-12">
            <div className="aspect-[2/3] w-40 sm:w-48 md:w-56 lg:w-64 shrink-0 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 animate-pulse" />

            <div className="w-full max-w-3xl flex-1 space-y-4">
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-white/[0.08] animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-white/[0.05] animate-pulse" />
              </div>
              <div className="h-11 sm:h-14 w-72 rounded-xl bg-white/[0.09] animate-pulse" />
              <div className="h-4 w-80 rounded bg-white/[0.06] animate-pulse" />
              <div className="space-y-2 pt-1">
                <div className="h-4 w-full rounded bg-white/[0.05] animate-pulse" />
                <div className="h-4 w-11/12 rounded bg-white/[0.05] animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-white/[0.05] animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="h-9 w-22 rounded-full bg-white/[0.07] animate-pulse" />
                <div className="h-9 w-26 rounded-full bg-white/[0.07] animate-pulse" />
                <div className="h-9 w-20 rounded-full bg-white/[0.07] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Known For 6-Up Rail Skeleton */}
      <section className="container mx-auto px-4 sm:px-6 md:px-10 py-8">
        <div className="mb-4 space-y-1.5">
          <div className="h-2.5 w-28 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-6 w-36 rounded bg-white/[0.09] animate-pulse" />
        </div>
        <div className="grid grid-cols-2 min-[520px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[2/3] rounded-xl bg-white/[0.05] animate-pulse" />
              <div className="h-3.5 w-4/5 rounded bg-white/[0.07] animate-pulse" />
              <div className="h-3 w-3/5 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Bento Grid Skeleton */}
      <section className="container mx-auto px-4 sm:px-6 md:px-10 py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="h-64 rounded-2xl border border-white/[0.07] bg-white/[0.025] animate-pulse lg:col-span-4" />
          <div className="h-64 rounded-2xl border border-white/[0.07] bg-white/[0.025] animate-pulse lg:col-span-5" />
          <div className="h-64 rounded-2xl border border-white/[0.07] bg-white/[0.025] animate-pulse lg:col-span-3" />
        </div>
      </section>
    </main>
  );
}
