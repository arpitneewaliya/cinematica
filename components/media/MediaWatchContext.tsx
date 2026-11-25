"use client";

import * as React from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
  getMediaWatchEntries,
  removeFromWatchedHistory,
  type MediaWatchEntry,
} from "@/app/actions/watched";
import { LogWatchedModal } from "./LogWatchedModal";

interface MediaWatchContextValue {
  entries: MediaWatchEntry[];
  isLoading: boolean;
  isModalOpen: boolean;
  openLogModal: () => void;
  closeLogModal: () => void;
  deleteEntry: (entryId: string) => Promise<void>;
}

const MediaWatchContext = React.createContext<MediaWatchContextValue | undefined>(
  undefined
);

interface MediaWatchProviderProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  children: React.ReactNode;
}

export function MediaWatchProvider({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  runtime,
  children,
}: MediaWatchProviderProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const [entries, setEntries] = React.useState<MediaWatchEntry[]>([]);
  const [loadedKey, setLoadedKey] = React.useState<string>("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const currentKey = `${mediaType}:${mediaId}`;

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let active = true;
    getMediaWatchEntries(mediaId, mediaType)
      .then((fetched) => {
        if (active) {
          setEntries(fetched);
          setLoadedKey(currentKey);
        }
      })
      .catch((err) => {
        console.error("Failed to load watch entries:", err);
        if (active) {
          setLoadedKey(currentKey);
        }
      });

    return () => {
      active = false;
    };
  }, [mediaId, mediaType, currentKey, isLoaded, isSignedIn]);

  const activeEntries = React.useMemo(
    () => (isSignedIn && loadedKey === currentKey ? entries : []),
    [isSignedIn, loadedKey, currentKey, entries]
  );

  const isLoading = Boolean(isLoaded && isSignedIn && loadedKey !== currentKey);

  const openLogModal = React.useCallback(() => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setIsModalOpen(true);
  }, [isSignedIn, openSignIn]);

  const closeLogModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSaved = React.useCallback((created?: MediaWatchEntry) => {
    if (created) {
      setEntries((prev) =>
        [created, ...prev].toSorted(
          (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
        )
      );
      return;
    }
    getMediaWatchEntries(mediaId, mediaType)
      .then((fetched) => setEntries(fetched))
      .catch(() => {});
  }, [mediaId, mediaType]);

  const deleteEntry = React.useCallback(
    async (entryId: string) => {
      let removed: MediaWatchEntry | undefined;
      setEntries((prev) => {
        removed = prev.find((e) => e.id === entryId);
        return prev.filter((e) => e.id !== entryId);
      });

      const res = await removeFromWatchedHistory(entryId);
      if (!res.success && removed) {
        const entryToRestore = removed;
        setEntries((prev) =>
          [entryToRestore, ...prev].toSorted(
            (a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()
          )
        );
      }
    },
    []
  );

  return (
    <MediaWatchContext.Provider
      value={{
        entries: activeEntries,
        isLoading,
        isModalOpen,
        openLogModal,
        closeLogModal,
        deleteEntry,
      }}
    >
      {children}
      {isModalOpen && (
        <LogWatchedModal
          mediaId={mediaId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          backdropPath={backdropPath}
          releaseDate={releaseDate}
          runtime={runtime}
          onClose={closeLogModal}
          onSuccess={handleSaved}
        />
      )}
    </MediaWatchContext.Provider>
  );
}

export function useOptionalMediaWatch() {
  return React.useContext(MediaWatchContext);
}
