"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { getUserWatchedMediaSummary } from "@/app/actions/watched";
import { PersonDetails } from "@/types/tmdb";
import { NormalizedPersonCredit, PersonCareerStats } from "@/lib/person-credits";
import { PersonBentoGrid } from "./PersonBentoGrid";
import { PersonFilmography } from "./PersonFilmography";

interface PersonInteractiveBodyProps {
  person: PersonDetails;
  credits: NormalizedPersonCredit[];
  stats: PersonCareerStats;
  defaultHideSelf: boolean;
}

export function PersonInteractiveBody({
  person,
  credits,
  stats,
  defaultHideSelf,
}: PersonInteractiveBodyProps) {
  const { isSignedIn } = useAuth();
  const [watchedEntries, setWatchedEntries] = React.useState<
    Array<{ key: string; rating: number | null }>
  >([]);

  const [selectedDecade, setSelectedDecade] = React.useState<string | null>(null);
  const [selectedGenreId, setSelectedGenreId] = React.useState<number | null>(null);
  const [watchStatus, setWatchStatus] = React.useState<
    "all" | "unwatched" | "watched"
  >("all");

  React.useEffect(() => {
    if (!isSignedIn) return;
    let active = true;
    getUserWatchedMediaSummary()
      .then((rows) => {
        if (!active) return;
        setWatchedEntries(
          rows.map((r) => ({
            key: `${r.mediaType}:${r.mediaId}`,
            rating: r.rating,
          }))
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isSignedIn]);

  const watchedMap = React.useMemo(() => {
    if (!isSignedIn) return new Map<string, number | null>();
    return new Map(watchedEntries.map((e) => [e.key, e.rating]));
  }, [isSignedIn, watchedEntries]);

  const scrollToFilmography = () => {
    const el = document.getElementById("filmography");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelectDecade = (decade: string) => {
    setSelectedDecade((prev) => {
      const next = prev === decade ? null : decade;
      if (next !== null) scrollToFilmography();
      return next;
    });
  };

  const handleSelectGenre = (genreId: number) => {
    setSelectedGenreId((prev) => {
      const next = prev === genreId ? null : genreId;
      if (next !== null) scrollToFilmography();
      return next;
    });
  };

  const handleSelectWatchStatus = (status: "all" | "unwatched" | "watched") => {
    setWatchStatus(status);
    if (status !== "all") scrollToFilmography();
  };

  return (
    <>
      <PersonBentoGrid
        person={person}
        credits={credits}
        stats={stats}
        defaultHideSelf={defaultHideSelf}
        watchedMap={watchedMap}
        selectedDecade={selectedDecade}
        selectedGenreId={selectedGenreId}
        watchStatus={watchStatus}
        onSelectDecade={handleSelectDecade}
        onSelectGenre={handleSelectGenre}
        onSelectWatchStatus={handleSelectWatchStatus}
      />

      <PersonFilmography
        credits={credits}
        departmentTabs={stats.departmentTabs}
        defaultHideSelf={defaultHideSelf}
        watchedMap={watchedMap}
        selectedDecade={selectedDecade}
        selectedGenreId={selectedGenreId}
        watchStatus={watchStatus}
        onClearDecade={() => setSelectedDecade(null)}
        onClearGenre={() => setSelectedGenreId(null)}
        onChangeWatchStatus={setWatchStatus}
      />
    </>
  );
}
