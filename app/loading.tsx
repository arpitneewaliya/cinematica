const skeletonRows = Array.from({ length: 4 });
const skeletonCards = Array.from({ length: 10 });

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] pb-16" aria-label="Loading Cinematica">
      <div className="h-[min(82svh,700px)] min-h-[520px] bg-[radial-gradient(circle_at_72%_30%,rgba(90,90,90,0.22),transparent_28%),linear-gradient(120deg,#080808,#171717_55%,#090909)]">
        <div className="container mx-auto flex h-full items-end px-4 pb-16 sm:px-6 md:items-center md:px-12 md:pb-0">
          <div className="w-full max-w-xl space-y-5">
            <div className="h-6 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="h-14 w-4/5 animate-pulse rounded-lg bg-white/10 md:h-20" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded bg-white/5" />
            <div className="h-12 w-40 animate-pulse rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-8 space-y-0 rounded-t-[2rem] bg-[#0a0a0a] pt-5 md:-mt-16 md:rounded-t-[3rem] md:pt-9">
        {skeletonRows.map((_, rowIndex) => (
          <section key={rowIndex} className="py-5 md:py-7">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-4 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                <div className="h-7 w-52 animate-pulse rounded bg-white/10" />
              </div>
              <div className="flex gap-2.5 overflow-hidden md:gap-3">
                {skeletonCards.map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    className="aspect-[2/3] shrink-0 basis-[72%] animate-pulse rounded-xl bg-white/5 min-[480px]:basis-[46%] sm:basis-[31%] md:basis-1/4"
                  />
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
