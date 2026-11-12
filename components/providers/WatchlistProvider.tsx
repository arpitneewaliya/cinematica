"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { addToWatchlist, removeFromWatchlist, getUserWatchlistIds } from "@/app/actions/watchlist";

interface WatchlistContextType {
  watchlistIds: Set<number>;
  isSaved: (mediaId: number) => boolean;
  toggleWatchlist: (data: {
    mediaId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    releaseDate?: string | null;
  }) => Promise<boolean>;
  isLoading: boolean;
}

const WatchlistContext = React.createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [watchlistIds, setWatchlistIds] = React.useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setWatchlistIds(new Set());
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    getUserWatchlistIds()
      .then((ids) => {
        if (isSubscribed) {
          setWatchlistIds(new Set(ids));
        }
      })
      .catch((err) => {
        console.error("Failed to load user watchlist IDs:", err);
      })
      .finally(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isSignedIn, isLoaded]);

  const isSaved = React.useCallback(
    (mediaId: number) => {
      return watchlistIds.has(mediaId);
    },
    [watchlistIds]
  );

  const toggleWatchlist = React.useCallback(
    async (data: {
      mediaId: number;
      mediaType: "movie" | "tv";
      title: string;
      posterPath?: string | null;
      backdropPath?: string | null;
      releaseDate?: string | null;
    }) => {
      if (!isSignedIn) {
        alert("Please sign in to manage your watchlist.");
        return false;
      }

      const wasSaved = watchlistIds.has(data.mediaId);

      // Optimistic update
      setWatchlistIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) {
          next.delete(data.mediaId);
        } else {
          next.add(data.mediaId);
        }
        return next;
      });

      try {
        if (wasSaved) {
          const res = await removeFromWatchlist(data.mediaId, data.mediaType);
          if (!res.success) {
            // Revert on failure
            setWatchlistIds((prev) => new Set(prev).add(data.mediaId));
            return false;
          }
        } else {
          const res = await addToWatchlist(data);
          if (!res.success) {
            // Revert on failure
            setWatchlistIds((prev) => {
              const next = new Set(prev);
              next.delete(data.mediaId);
              return next;
            });
            return false;
          }
        }
        return true;
      } catch (err) {
        console.error("Error toggling watchlist:", err);
        // Revert on error
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) {
            next.add(data.mediaId);
          } else {
            next.delete(data.mediaId);
          }
          return next;
        });
        return false;
      }
    },
    [isSignedIn, watchlistIds]
  );

  return (
    <WatchlistContext.Provider
      value={{
        watchlistIds,
        isSaved,
        toggleWatchlist,
        isLoading,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = React.useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}

