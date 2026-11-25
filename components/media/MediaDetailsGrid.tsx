"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpRight, Globe, Tv } from "lucide-react";
import { useCountry } from "@/components/providers/CountryProvider";
import type { CountryWatchProviders } from "@/lib/tmdb";
import type { Network, ProductionCompany } from "@/types/tmdb";

interface MediaDetailsGridProps {
  id: number;
  type: "movie" | "tv";
  status?: string;
  releaseDate?: string | null;
  lastAirDate?: string | null;
  runtime?: number | null;
  originalLanguage?: string;
  budget?: number;
  revenue?: number;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  productionCompanies?: ProductionCompany[];
  networks?: Network[];
  homepage?: string | null;
}

function formatCurrency(amount?: number): string | null {
  if (!amount || amount <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatLanguage(code?: string): string | null {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

export function MediaDetailsGrid({
  id,
  type,
  status,
  releaseDate,
  lastAirDate,
  runtime,
  originalLanguage,
  budget,
  revenue,
  numberOfSeasons,
  numberOfEpisodes,
  productionCompanies = [],
  networks = [],
  homepage,
}: MediaDetailsGridProps) {
  const { country } = useCountry();
  const [providerState, setProviderState] = React.useState<{
    key: string;
    data: CountryWatchProviders | null;
  }>({ key: "", data: null });

  const requestKey = `${type}:${id}:${country}`;

  React.useEffect(() => {
    let active = true;
    fetch(
      `/api/watch-providers?id=${id}&type=${type}&country=${encodeURIComponent(country)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data: CountryWatchProviders | null) => {
        if (active) {
          setProviderState({ key: requestKey, data });
        }
      })
      .catch((err) => {
        console.error("Failed to fetch watch providers:", err);
        if (active) {
          setProviderState({ key: requestKey, data: null });
        }
      });

    return () => {
      active = false;
    };
  }, [id, type, country, requestKey]);

  const loadingProviders = providerState.key !== requestKey;
  const providers = providerState.key === requestKey ? providerState.data : null;

  const streamOptions = providers
    ? [...(providers.free || []), ...(providers.flatrate || [])]
    : [];
  const rentBuyOptions = providers
    ? [...(providers.rent || []), ...(providers.buy || [])].filter(
        (v, i, a) => a.findIndex((t) => t.provider_id === v.provider_id) === i
      )
    : [];

  const facts: Array<{ label: string; value: string }> = [];
  if (status) facts.push({ label: "Status", value: status });

  const formattedRelease = formatDate(releaseDate);
  if (formattedRelease) {
    facts.push({
      label: type === "movie" ? "Release Date" : "First Aired",
      value: formattedRelease,
    });
  }

  if (type === "tv") {
    const formattedLastAir = formatDate(lastAirDate);
    if (formattedLastAir) {
      facts.push({ label: "Last Aired", value: formattedLastAir });
    }
    if (numberOfSeasons) {
      facts.push({
        label: "Run",
        value: `${numberOfSeasons} ${numberOfSeasons === 1 ? "Season" : "Seasons"}${
          numberOfEpisodes ? ` · ${numberOfEpisodes} Episodes` : ""
        }`,
      });
    }
  }

  if (runtime && runtime > 0) {
    const hrs = Math.floor(runtime / 60);
    const mins = runtime % 60;
    facts.push({
      label: type === "movie" ? "Runtime" : "Episode Runtime",
      value: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
    });
  }

  const languageName = formatLanguage(originalLanguage);
  if (languageName) {
    facts.push({ label: "Original Language", value: languageName });
  }

  if (type === "movie") {
    const formattedBudget = formatCurrency(budget);
    const formattedRevenue = formatCurrency(revenue);
    if (formattedBudget) facts.push({ label: "Budget", value: formattedBudget });
    if (formattedRevenue) facts.push({ label: "Box Office", value: formattedRevenue });
  }

  if (type === "tv" && networks.length > 0) {
    facts.push({
      label: networks.length === 1 ? "Network" : "Networks",
      value: networks.slice(0, 3).map((n) => n.name).join(", "),
    });
  }

  if (productionCompanies.length > 0) {
    facts.push({
      label: "Studios",
      value: productionCompanies
        .slice(0, 3)
        .map((c) => c.name)
        .join(", "),
    });
  }

  return (
    <section
      aria-label="Availability and production details"
      className="container mx-auto px-4 sm:px-6 md:px-10 pt-6 md:pt-8"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Where to Watch */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Availability
                </p>
                <h2 className="font-heading text-base sm:text-lg font-bold text-white">
                  Where to Watch
                </h2>
              </div>
              <span className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                {country}
              </span>
            </div>

            {loadingProviders ? (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.05]"
                  />
                ))}
              </div>
            ) : streamOptions.length === 0 && rentBuyOptions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-4 text-xs sm:text-sm text-zinc-400">
                <div className="flex items-center gap-2 font-medium text-zinc-300 mb-1">
                  <Tv className="size-4 text-zinc-500" />
                  <span>No active listings in {country}</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Switch regions in the top bar or{" "}
                  <a
                    href={providers?.link || "https://www.justwatch.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 underline underline-offset-4 hover:text-white"
                  >
                    check JustWatch
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {streamOptions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Stream
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {streamOptions.slice(0, 8).map((p) => (
                        <a
                          key={p.provider_id}
                          href={providers?.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] pr-3 p-1 transition-all hover:border-white/25 hover:bg-white/[0.1]"
                        >
                          <div className="relative size-8 overflow-hidden rounded-lg bg-black/50 shrink-0">
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                              alt={p.provider_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                            {p.provider_name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {rentBuyOptions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      Rent or Buy
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rentBuyOptions.slice(0, 8).map((p) => (
                        <a
                          key={p.provider_id}
                          href={providers?.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] pr-3 p-1 transition-all hover:border-white/25 hover:bg-white/[0.1]"
                        >
                          <div className="relative size-7 overflow-hidden rounded-lg bg-black/50 shrink-0">
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                              alt={p.provider_name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-xs font-medium text-zinc-300 group-hover:text-white">
                            {p.provider_name}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {providers?.link && (streamOptions.length > 0 || rentBuyOptions.length > 0) && (
            <a
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors w-fit"
            >
              <span>Provider data via JustWatch</span>
              <ArrowUpRight className="size-3" />
            </a>
          )}
        </div>

        {/* Film / Series Facts */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 lg:col-span-7 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Specifications
                </p>
                <h2 className="font-heading text-base sm:text-lg font-bold text-white">
                  {type === "movie" ? "Film Facts" : "Series Facts"}
                </h2>
              </div>

              {homepage && (
                <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
                >
                  <Globe className="size-3.5" />
                  <span>Official Site</span>
                </a>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="space-y-1">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {fact.label}
                  </dt>
                  <dd className="text-xs sm:text-sm font-medium text-zinc-100 tabular-nums">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
