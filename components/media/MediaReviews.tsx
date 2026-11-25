"use client";

import * as React from "react";
import { Star } from "lucide-react";
import type { TMDBReview } from "@/types/tmdb";

interface MediaReviewsProps {
  reviews: TMDBReview[];
}

function ReviewCard({ review }: { review: TMDBReview }) {
  const [expanded, setExpanded] = React.useState(false);
  const authorName =
    review.author_details?.name || review.author_details?.username || review.author || "Anonymous";
  const initial = authorName.charAt(0).toUpperCase();
  const dateFormatted = review.created_at
    ? new Date(review.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;
  const isLong = review.content.length > 260;

  return (
    <article className="glass-panel rounded-2xl p-5 flex flex-col justify-between gap-3.5">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.07] font-heading text-xs font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-heading text-sm font-semibold text-white">
                {authorName}
              </h3>
              {dateFormatted && (
                <p className="text-[11px] text-zinc-500 tabular-nums">
                  {dateFormatted}
                </p>
              )}
            </div>
          </div>

          {review.author_details?.rating !== null &&
            review.author_details?.rating !== undefined && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/12 bg-black/45 px-2.5 py-0.5 text-xs font-semibold text-white tabular-nums">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {review.author_details.rating.toFixed(1)}
              </span>
            )}
        </div>

        <p
          className={`text-xs sm:text-sm leading-relaxed text-zinc-300 whitespace-pre-line ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          {review.content}
        </p>
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-fit text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {expanded ? "Show less" : "Read full review"}
        </button>
      )}
    </article>
  );
}

export function MediaReviews({ reviews }: MediaReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  const displayReviews = reviews.slice(0, 4);

  return (
    <section
      aria-labelledby="audience-reviews-heading"
      className="container mx-auto px-4 sm:px-6 md:px-10 pt-8 md:pt-12"
    >
      <div className="mb-4 space-y-0.5">
        <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Community Perspective
        </p>
        <h2
          id="audience-reviews-heading"
          className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl"
        >
          Audience Reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {displayReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
