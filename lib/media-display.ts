export function formatMediaRating(rating: number | null | undefined): string {
  return typeof rating === "number" && Number.isFinite(rating) && rating > 0
    ? rating.toFixed(1)
    : "Not rated yet";
}

export function getMediaReleaseInfo(releaseDate?: string | null) {
  const year = releaseDate?.match(/^\d{4}/)?.[0] ?? "";
  const isValidDate = Boolean(releaseDate && /^\d{4}-\d{2}-\d{2}$/.test(releaseDate));
  const today = new Date().toISOString().slice(0, 10);

  return {
    year,
    isUpcoming: Boolean(releaseDate && isValidDate && releaseDate > today),
  };
}
