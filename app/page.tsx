import {
  fetchMoviesByGenre,
  fetchMoviesByIds,
  fetchHeroMedia,
  fetchTrendingMedia,
  fetchNowPlayingMovies,
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTopRatedTvShows,
  fetchTrendingMovies,
  fetchTrendingTvShows,
} from "@/lib/tmdb";
import { Hero } from "@/components/Hero";
import { GenrePillBar } from "@/components/GenrePillBar";
import { WatchlistRail } from "@/components/WatchlistRail";
import { TopTenRail } from "@/components/TopTenRail";
import { MediaRail } from "@/components/MediaRail";
import { BackdropRail } from "@/components/BackdropRail";

export const revalidate = 3600; // Cache page on Vercel CDN for 1 hour

const OSCAR_BEST_PICTURE_WINNERS = [
  238, // The Godfather
  240, // The Godfather Part II
  510, // One Flew Over the Cuckoo's Nest
  279, // Amadeus
  792, // Platoon
  274, // The Silence of the Lambs
  424, // Schindler's List
  6977, // No Country for Old Men
  12405, // Slumdog Millionaire
  496243, // Parasite
];

export const metadata = {
  title: "Cinematica — Discover Cinema & Television",
  description:
    "Explore trending cinema and television, log your watch history, and curate personal collections.",
};

export default async function Home() {
  const [
    heroItems,
    trendingAll,
    trendingMovies,
    trendingTvShows,
    awardWinningFilms,
    topRatedMovies,
    topRatedTvShows,
    newReleases,
    popularMovies,
    sciFiFantasy,
  ] = await Promise.all([
    fetchHeroMedia(),
    fetchTrendingMedia(),
    fetchTrendingMovies(),
    fetchTrendingTvShows(),
    fetchMoviesByIds(OSCAR_BEST_PICTURE_WINNERS),
    fetchTopRatedMovies(),
    fetchTopRatedTvShows(),
    fetchNowPlayingMovies(),
    fetchPopularMovies(),
    fetchMoviesByGenre([878, 14]),
  ]);

  const hasData =
    heroItems.length > 0 || trendingMovies.length > 0 || trendingTvShows.length > 0;

  const featuredKeys = new Set(
    heroItems.map((item) => `${item.media_type}:${item.id}`)
  );
  const remainingMovies = trendingMovies.filter(
    (item) => !featuredKeys.has(`movie:${item.id}`)
  );
  const remainingTvShows = trendingTvShows.filter(
    (item) => !featuredKeys.has(`tv:${item.id}`)
  );

  return (
    <main className="min-h-screen overflow-x-clip bg-[#070708] pb-14">
      {hasData ? (
        <>
          {heroItems.length > 0 && <Hero items={heroItems} />}

          <GenrePillBar />

          <div className="relative z-20 pt-2 md:pt-4">
            <WatchlistRail />

            <TopTenRail
              items={trendingAll}
              title="Top 10 Today"
              eyebrow="Daily Global Ranking"
            />

            <MediaRail
              title="Trending Films"
              eyebrow="Momentum Right Now"
              items={remainingMovies}
              exploreHref="/movies"
            />

            <MediaRail
              title="Trending Series"
              eyebrow="Most Watched Television"
              items={remainingTvShows}
              exploreHref="/tv"
            />

            <div className="my-2 border-y border-white/[0.06] bg-white/[0.015]">
              <BackdropRail
                title="Academy Award Winners"
                eyebrow="Best Picture Collection"
                items={awardWinningFilms}
                exploreHref="/movies?tab=topRated"
              />
            </div>

            <MediaRail
              title="Critically Acclaimed Films"
              eyebrow="All-Time Highest Rated"
              items={topRatedMovies}
              exploreHref="/movies?tab=topRated"
            />

            <MediaRail
              title="Acclaimed Television"
              eyebrow="Prestige Series"
              items={topRatedTvShows}
              exploreHref="/tv?tab=topRated"
            />

            <div className="my-2 border-y border-white/[0.06] bg-white/[0.015]">
              <BackdropRail
                title="In Theaters & New Releases"
                eyebrow="Fresh on Screen"
                items={newReleases}
                exploreHref="/movies"
              />
            </div>

            <MediaRail
              title="Audience Favorites"
              eyebrow="Popular Cinema"
              items={popularMovies}
              exploreHref="/movies"
            />

            <MediaRail
              title="Sci-Fi & Fantasy"
              eyebrow="Worlds Beyond"
              items={sciFiFantasy}
              exploreHref="/movies?genre=878,14"
            />
          </div>
        </>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-3 font-heading text-3xl font-bold text-white">
            Welcome to Cinematica
          </h1>
          <p className="max-w-md text-sm text-zinc-400">
            Please add your TMDB API Key to the <code className="text-zinc-200">.env.local</code> file to explore trending films and series.
          </p>
        </div>
      )}
    </main>
  );
}
