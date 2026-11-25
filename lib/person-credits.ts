import { MOVIE_GENRES, TV_GENRES } from "@/lib/explore-config";
import {
  PersonCreditCastItem,
  PersonCreditCrewItem,
  PersonCreditsResponse,
  PersonDetails,
} from "@/types/tmdb";

export interface PersonCreditRole {
  department: string;
  label: string;
  episodeCount?: number;
  isSelfRole: boolean;
}

export interface NormalizedPersonCredit {
  key: string;
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  year: number | null;
  isUpcoming: boolean;
  decade: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  overview: string;
  departments: string[];
  roles: PersonCreditRole[];
  primaryRoleLabel: string;
  totalEpisodes: number;
  isSelfAppearance: boolean;
  knownForScore: number;
}

export interface PersonGenreStat {
  id: number;
  name: string;
  count: number;
  percentage: number;
}

export interface PersonDecadeStat {
  decade: string;
  count: number;
  avgRating: number | null;
}

export interface PersonDepartmentTab {
  id: string;
  label: string;
  count: number;
}

export interface PersonCareerStats {
  yearsActiveLabel: string;
  careerSpanYears: number;
  totalDistinctTitles: number;
  releasedTitlesCount: number;
  movieCount: number;
  tvCount: number;
  averageRating: number | null;
  highestRatedCredit: {
    id: number;
    mediaType: "movie" | "tv";
    title: string;
    year: number | null;
    voteAverage: number;
  } | null;
  topGenres: PersonGenreStat[];
  decadeBreakdown: PersonDecadeStat[];
  departmentTabs: PersonDepartmentTab[];
}

export interface PersonCreditAnalysis {
  credits: NormalizedPersonCredit[];
  knownFor: NormalizedPersonCredit[];
  heroBackdrop: {
    backdropPath: string;
    title: string;
    href: string;
  } | null;
  activeCrafts: string[];
  defaultHideSelf: boolean;
  stats: PersonCareerStats;
}

const COMBINED_GENRE_MAP: Record<number, string> = {
  ...Object.fromEntries(MOVIE_GENRES.map((g) => [g.id, g.name])),
  ...Object.fromEntries(TV_GENRES.map((g) => [g.id, g.name])),
};

const TALK_NEWS_GENRE_IDS = new Set([10767, 10763]); // Talk, News
const SELF_PATTERN = /\b(self|himself|herself|themselves|archive footage|uncredited self)\b/i;

function isSelfCastRole(item: PersonCreditCastItem): boolean {
  const genres = item.genre_ids || [];
  if (genres.some((id) => TALK_NEWS_GENRE_IDS.has(id))) {
    return true;
  }
  const char = (item.character || "").trim();
  if (!char) return false;
  if (/\(voice\)/i.test(char)) return false;
  return SELF_PATTERN.test(char);
}

function isSelfCrewRole(item: PersonCreditCrewItem): boolean {
  const genres = item.genre_ids || [];
  return genres.some((id) => TALK_NEWS_GENRE_IDS.has(id));
}

function normalizeCrewDepartment(department?: string, job?: string): string {
  const j = (job || "").trim().toLowerCase();
  if (j === "creator") return "Creator";
  const d = (department || "").trim();
  if (!d) return "Crew";
  return d;
}

function getDecadeLabel(year: number | null, isUpcoming: boolean): string {
  if (isUpcoming || year === null) return "Upcoming";
  if (year < 1970) return "Pre-1970";
  const dec = Math.floor(year / 10) * 10;
  return `${dec}s`;
}

function computePrimaryRoleLabel(roles: PersonCreditRole[]): string {
  if (roles.length === 0) return "";
  const actingRole = roles.find((r) => r.department === "Acting");
  const crewRoles = roles.filter((r) => r.department !== "Acting");

  const parts: string[] = [];
  if (actingRole) {
    parts.push(actingRole.label ? `as ${actingRole.label}` : "Actor");
  }
  const uniqueCrewLabels = Array.from(
    new Set(crewRoles.map((r) => r.label).filter(Boolean))
  );
  if (uniqueCrewLabels.length > 0) {
    parts.push(uniqueCrewLabels.slice(0, 3).join(" · "));
  }
  return parts.join(" · ");
}

export function analyzePersonCredits(
  person: PersonDetails,
  credits?: PersonCreditsResponse | null
): PersonCreditAnalysis {
  const todayISO = new Date().toISOString().slice(0, 10);
  const rawCast = credits?.cast || [];
  const rawCrew = credits?.crew || [];

  interface MutableCredit {
    key: string;
    id: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    releaseDate: string;
    voteAverage: number;
    voteCount: number;
    popularity: number;
    overview: string;
    genreIds: Set<number>;
    departments: Set<string>;
    roles: PersonCreditRole[];
    totalEpisodes: number;
    minOrder: number | null;
  }

  const map = new Map<string, MutableCredit>();

  const getOrCreate = (
    raw: PersonCreditCastItem | PersonCreditCrewItem
  ): MutableCredit => {
    const key = `${raw.media_type}:${raw.id}`;
    let entry = map.get(key);
    const releaseDate = raw.release_date || raw.first_air_date || "";
    if (!entry) {
      entry = {
        key,
        id: raw.id,
        mediaType: raw.media_type,
        title: raw.title || raw.name || "Untitled",
        posterPath: raw.poster_path || null,
        backdropPath: raw.backdrop_path || null,
        releaseDate,
        voteAverage: raw.vote_average || 0,
        voteCount: raw.vote_count || 0,
        popularity: raw.popularity || 0,
        overview: raw.overview || "",
        genreIds: new Set(raw.genre_ids || []),
        departments: new Set<string>(),
        roles: [],
        totalEpisodes: 0,
        minOrder: null,
      };
      map.set(key, entry);
    } else {
      if (!entry.posterPath && raw.poster_path) entry.posterPath = raw.poster_path;
      if (!entry.backdropPath && raw.backdrop_path) entry.backdropPath = raw.backdrop_path;
      if (!entry.releaseDate && releaseDate) entry.releaseDate = releaseDate;
      if (!entry.overview && raw.overview) entry.overview = raw.overview;
      for (const gid of raw.genre_ids || []) entry.genreIds.add(gid);
    }
    return entry;
  };

  for (const c of rawCast) {
    const entry = getOrCreate(c);
    entry.departments.add("Acting");
    const epCount = c.episode_count || 0;
    if (epCount > entry.totalEpisodes) {
      entry.totalEpisodes = epCount;
    }
    if (typeof c.order === "number") {
      entry.minOrder =
        entry.minOrder === null ? c.order : Math.min(entry.minOrder, c.order);
    }
    const cleanChar = (c.character || "").trim();
    entry.roles.push({
      department: "Acting",
      label: cleanChar,
      episodeCount: c.episode_count,
      isSelfRole: isSelfCastRole(c),
    });
  }

  for (const cr of rawCrew) {
    const entry = getOrCreate(cr);
    const dept = normalizeCrewDepartment(cr.department, cr.job);
    entry.departments.add(dept);
    const epCount = cr.episode_count || 0;
    if (epCount > entry.totalEpisodes) {
      entry.totalEpisodes = epCount;
    }
    const jobLabel = (cr.job || dept).trim();
    // Avoid duplicate job entries on the same title
    const alreadyHasRole = entry.roles.some(
      (r) => r.department === dept && r.label.toLowerCase() === jobLabel.toLowerCase()
    );
    if (!alreadyHasRole) {
      entry.roles.push({
        department: dept,
        label: jobLabel,
        episodeCount: cr.episode_count,
        isSelfRole: isSelfCrewRole(cr),
      });
    }
  }

  const primaryDept = person.known_for_department || "Acting";

  const normalizedCredits: NormalizedPersonCredit[] = Array.from(map.values()).map(
    (entry) => {
      const yearMatch = entry.releaseDate.match(/^\d{4}/);
      const year = yearMatch ? Number(yearMatch[0]) : null;
      const isValidFullDate = /^\d{4}-\d{2}-\d{2}$/.test(entry.releaseDate);
      const isUpcoming =
        year === null || (isValidFullDate && entry.releaseDate > todayISO);
      const decade = getDecadeLabel(year, isUpcoming);
      const isSelfAppearance =
        entry.roles.length > 0 && entry.roles.every((r) => r.isSelfRole);

      const departments = Array.from(entry.departments);
      const primaryRoleLabel = computePrimaryRoleLabel(entry.roles);

      // Weighted score for "Known For" & signature backdrop selection
      const voteWeight = Math.log10((entry.voteCount || 1) + 1);
      const qualityWeight = Math.max(entry.voteAverage || 5, 4);
      const popBoost = 1 + Math.min(entry.popularity || 0, 120) / 180;
      const deptMatchBoost = departments.includes(primaryDept) ? 1.35 : 1.0;
      const selfPenalty = isSelfAppearance ? 0.15 : 1.0;
      const billingBoost =
        entry.minOrder !== null
          ? entry.minOrder <= 3
            ? 1.25
            : entry.minOrder <= 8
              ? 1.08
              : 0.92
          : 1.0;
      const tvEpisodeFactor =
        entry.mediaType === "tv" && entry.totalEpisodes > 0 && entry.totalEpisodes <= 2
          ? 0.55
          : 1.0;

      const knownForScore =
        voteWeight *
        qualityWeight *
        popBoost *
        deptMatchBoost *
        selfPenalty *
        billingBoost *
        tvEpisodeFactor;

      return {
        key: entry.key,
        id: entry.id,
        mediaType: entry.mediaType,
        title: entry.title,
        posterPath: entry.posterPath,
        backdropPath: entry.backdropPath,
        releaseDate: entry.releaseDate,
        year,
        isUpcoming,
        decade,
        voteAverage: entry.voteAverage,
        voteCount: entry.voteCount,
        popularity: entry.popularity,
        genreIds: Array.from(entry.genreIds),
        overview: entry.overview,
        departments,
        roles: entry.roles,
        primaryRoleLabel,
        totalEpisodes: entry.totalEpisodes,
        isSelfAppearance,
        knownForScore,
      };
    }
  );

  // Determine smart default for "Hide Self & Talk Shows"
  const substantiveCredits = normalizedCredits.filter((c) => !c.isSelfAppearance);
  const defaultHideSelf = substantiveCredits.length >= 3;
  const analyticsPool = defaultHideSelf ? substantiveCredits : normalizedCredits;

  // Known For top 18 with posters
  const knownFor = [...analyticsPool]
    .filter((c) => Boolean(c.posterPath))
    .sort((a, b) => b.knownForScore - a.knownForScore)
    .slice(0, 18);

  // Signature backdrop from top Known For work with backdrop artwork
  const backdropSource =
    knownFor.find((c) => Boolean(c.backdropPath)) ||
    normalizedCredits.find((c) => Boolean(c.backdropPath));
  const heroBackdrop = backdropSource?.backdropPath
    ? {
        backdropPath: backdropSource.backdropPath,
        title: backdropSource.title,
        href: `/${backdropSource.mediaType}/${backdropSource.id}`,
      }
    : null;

  // Department counts & tabs
  const deptCounts = new Map<string, number>();
  for (const credit of analyticsPool) {
    for (const dept of credit.departments) {
      deptCounts.set(dept, (deptCounts.get(dept) || 0) + 1);
    }
  }

  const sortedDepts = Array.from(deptCounts.entries())
    .sort((a, b) => {
      if (a[0] === primaryDept) return -1;
      if (b[0] === primaryDept) return 1;
      return b[1] - a[1];
    })
    .map(([dept, count]) => ({ id: dept, label: dept, count }));

  const activeCrafts = sortedDepts.slice(0, 3).map((d) => d.label);
  if (activeCrafts.length === 0 && primaryDept) {
    activeCrafts.push(primaryDept);
  }

  const departmentTabs: PersonDepartmentTab[] = [
    { id: "all", label: "All", count: analyticsPool.length },
    ...sortedDepts,
  ];

  // Released years & active span
  const releasedYears = analyticsPool
    .filter((c) => !c.isUpcoming && c.year !== null)
    .map((c) => c.year as number);

  const minYear = releasedYears.length > 0 ? Math.min(...releasedYears) : null;
  const maxYear = releasedYears.length > 0 ? Math.max(...releasedYears) : null;
  const currentYear = new Date().getFullYear();

  let yearsActiveLabel = "—";
  let careerSpanYears = 0;
  if (minYear !== null && maxYear !== null) {
    const endYear = person.deathday
      ? maxYear
      : maxYear >= currentYear - 2
        ? null
        : maxYear;
    yearsActiveLabel =
      endYear === null
        ? `${minYear}–Present`
        : minYear === endYear
          ? `${minYear}`
          : `${minYear}–${endYear}`;
    careerSpanYears = Math.max(1, (endYear ?? currentYear) - minYear + 1);
  }

  // Average rating & highest rated
  const ratedSubstantive = analyticsPool.filter(
    (c) => c.voteAverage > 0 && c.voteCount >= 20
  );
  const averageRating =
    ratedSubstantive.length > 0
      ? Number(
          (
            ratedSubstantive.reduce((sum, c) => sum + c.voteAverage, 0) /
            ratedSubstantive.length
          ).toFixed(1)
        )
      : null;

  const highConfidenceRated = analyticsPool.filter(
    (c) => c.voteAverage > 0 && c.voteCount >= 100
  );
  const highestPool =
    highConfidenceRated.length > 0 ? highConfidenceRated : ratedSubstantive;
  const highestBest = [...highestPool].sort((a, b) => {
    if (Math.abs(b.voteAverage - a.voteAverage) > 0.15) {
      return b.voteAverage - a.voteAverage;
    }
    return b.voteCount - a.voteCount;
  })[0];

  const highestRatedCredit = highestBest
    ? {
        id: highestBest.id,
        mediaType: highestBest.mediaType,
        title: highestBest.title,
        year: highestBest.year,
        voteAverage: highestBest.voteAverage,
      }
    : null;

  // Signature Genres
  const genreCounts = new Map<number, number>();
  for (const credit of analyticsPool) {
    for (const gid of credit.genreIds) {
      if (COMBINED_GENRE_MAP[gid]) {
        genreCounts.set(gid, (genreCounts.get(gid) || 0) + 1);
      }
    }
  }
  const totalGenreMentions = Array.from(genreCounts.values()).reduce(
    (acc, v) => acc + v,
    0
  );
  const topGenres: PersonGenreStat[] = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      name: COMBINED_GENRE_MAP[id],
      count,
      percentage:
        totalGenreMentions > 0 ? Math.round((count / totalGenreMentions) * 100) : 0,
    }));

  // Decade breakdown (chronological newest -> oldest, excluding Upcoming)
  const decadeGroups = new Map<
    string,
    { count: number; ratingSum: number; ratingCount: number }
  >();
  for (const credit of analyticsPool) {
    if (credit.decade === "Upcoming") continue;
    const prev = decadeGroups.get(credit.decade) || {
      count: 0,
      ratingSum: 0,
      ratingCount: 0,
    };
    prev.count += 1;
    if (credit.voteAverage > 0 && credit.voteCount >= 20) {
      prev.ratingSum += credit.voteAverage;
      prev.ratingCount += 1;
    }
    decadeGroups.set(credit.decade, prev);
  }

  const decadeOrder = (label: string) =>
    label === "Pre-1970" ? 1960 : parseInt(label.slice(0, 4), 10);

  const decadeBreakdown: PersonDecadeStat[] = Array.from(decadeGroups.entries())
    .sort((a, b) => decadeOrder(b[0]) - decadeOrder(a[0]))
    .slice(0, 6)
    .map(([decade, info]) => ({
      decade,
      count: info.count,
      avgRating:
        info.ratingCount > 0
          ? Number((info.ratingSum / info.ratingCount).toFixed(1))
          : null,
    }));

  const releasedTitlesCount = analyticsPool.filter((c) => !c.isUpcoming).length;

  return {
    credits: normalizedCredits,
    knownFor,
    heroBackdrop,
    activeCrafts,
    defaultHideSelf,
    stats: {
      yearsActiveLabel,
      careerSpanYears,
      totalDistinctTitles: analyticsPool.length,
      releasedTitlesCount,
      movieCount: analyticsPool.filter((c) => c.mediaType === "movie").length,
      tvCount: analyticsPool.filter((c) => c.mediaType === "tv").length,
      averageRating,
      highestRatedCredit,
      topGenres,
      decadeBreakdown,
      departmentTabs,
    },
  };
}
