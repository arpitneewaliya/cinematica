"use client";

import * as React from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlistSummary,
  type WatchlistSummaryItem,
} from "@/app/actions/watchlist";

interface WatchlistContextType {
  items: WatchlistSummaryItem[];
  watchlistIds: Set<number>;
  isSaved: (mediaId: number, mediaType?: "movie" | "tv") => boolean;
  toggleWatchlist: (data: {
    mediaId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    releaseDate?: string | null;
  }) => Promise<boolean>;
  removeLocalItem: (mediaId: number, mediaType: "movie" | "tv") => void;
  isLoading: boolean;
}

const WatchlistContext = React.createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const [items, setItems] = React.useState<WatchlistSummaryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let isSubscribed = true;

    getUserWatchlistSummary()
      .then((fetched) => {
        if (isSubscribed) {
          setItems(fetched);
        }
      })
      .catch((err) => {
        console.error("Failed to load user watchlist:", err);
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

  const activeItems = React.useMemo(
    () => (isSignedIn ? items : []),
    [isSignedIn, items]
  );

  const savedKeys = React.useMemo(
    () => new Set(activeItems.map((item) => `${item.mediaType}:${item.mediaId}`)),
    [activeItems]
  );

  const watchlistIds = React.useMemo(
    () => new Set(activeItems.map((item) => item.mediaId)),
    [activeItems]
  );

  const isSaved = React.useCallback(
    (mediaId: number, mediaType?: "movie" | "tv") => {
      if (mediaType) {
        return savedKeys.has(`${mediaType}:${mediaId}`);
      }
      return watchlistIds.has(mediaId);
    },
    [savedKeys, watchlistIds]
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
        openSignIn();
        return false;
      }

      const key = `${data.mediaType}:${data.mediaId}`;
      const wasSaved = savedKeys.has(key);
      const newSummaryItem: WatchlistSummaryItem = {
        mediaId: data.mediaId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath ?? null,
        backdropPath: data.backdropPath ?? null,
        releaseDate: data.releaseDate ?? null,
      };

      // Optimistic update
      setItems((prev) => {
        if (wasSaved) {
          return prev.filter(
            (item) => !(item.mediaId === data.mediaId && item.mediaType === data.mediaType)
          );
        }
        return [newSummaryItem, ...prev];
      });

      try {
        if (wasSaved) {
          const res = await removeFromWatchlist(data.mediaId, data.mediaType);
          if (!res.success) {
            setItems((prev) => [newSummaryItem, ...prev]);
            return false;
          }
        } else {
          const res = await addToWatchlist(data);
          if (!res.success) {
            setItems((prev) =>
              prev.filter(
                (item) => !(item.mediaId === data.mediaId && item.mediaType === data.mediaType)
              )
            );
            return false;
          }
        }
        return true;
      } catch (err) {
        console.error("Error toggling watchlist:", err);
        setItems((prev) => {
          if (wasSaved) {
            return [newSummaryItem, ...prev];
          }
          return prev.filter(
            (item) => !(item.mediaId === data.mediaId && item.mediaType === data.mediaType)
          );
        });
        return false;
      }
    },
    [isSignedIn, openSignIn, savedKeys]
  );

  const removeLocalItem = React.useCallback(
    (mediaId: number, mediaType: "movie" | "tv") => {
      setItems((prev) =>
        prev.filter(
          (item) => !(item.mediaId === mediaId && item.mediaType === mediaType)
        )
      );
    },
    []
  );

  return (
    <WatchlistContext.Provider
      value={{
        items: activeItems,
        watchlistIds,
        isSaved,
        toggleWatchlist,
        removeLocalItem,
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
