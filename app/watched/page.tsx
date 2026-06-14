import { getUserWatchedHistory, getWatchStats } from "@/app/actions/watched";
import { HistoryFeed } from "@/components/media/HistoryFeed";

export const metadata = {
  title: "My Watch History - Cinematica",
  description: "Track the movies and TV shows you have watched, rate them, write notes, and view personal watch metrics.",
};

export default async function WatchedHistoryPage() {
  const [history, stats] = await Promise.all([
    getUserWatchedHistory(),
    getWatchStats(),
  ]);

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="w-2 h-10 bg-primary rounded-full inline-block"></span>
            My Watch History
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Keep track of everything you've watched in one place.
          </p>
        </div>

        <HistoryFeed initialItems={history} stats={stats} />
      </div>
    </main>
  );
}
