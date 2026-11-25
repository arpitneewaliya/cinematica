"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Film,
  Globe,
  MapPin,
  Share2,
  User,
} from "lucide-react";
import {
  FaFacebook,
  FaImdb,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { getImageUrl } from "@/lib/tmdb";
import { PersonDetails, PersonExternalIds } from "@/types/tmdb";

interface PersonHeroProps {
  person: PersonDetails;
  externalIds?: PersonExternalIds | null;
  heroBackdrop: {
    backdropPath: string;
    title: string;
    href: string;
  } | null;
  activeCrafts: string[];
  yearsActiveLabel: string;
  totalCreditsCount: number;
}

function calculateAge(birthday: string, deathday?: string | null): number | null {
  const birth = new Date(birthday);
  if (Number.isNaN(birth.getTime())) return null;
  const end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(end.getTime())) return null;
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatBirthYear(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^\d{4}/);
  return match ? match[0] : null;
}

export function PersonHero({
  person,
  externalIds,
  heroBackdrop,
  activeCrafts,
  yearsActiveLabel,
  totalCreditsCount,
}: PersonHeroProps) {
  const [bioExpanded, setBioExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const portraitUrl = getImageUrl(person.profile_path, "w500");
  const backdropUrl = heroBackdrop
    ? getImageUrl(heroBackdrop.backdropPath, "original")
    : "";

  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;
  const birthYear = formatBirthYear(person.birthday);
  const deathYear = formatBirthYear(person.deathday);

  const bioText = person.biography?.trim() || "";
  const isLongBio = bioText.length > 340;
  const bioParagraphs = bioText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${person.name} — Cinematica`,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or Web Share unavailable
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  const socialLinks = [
    externalIds?.imdb_id
      ? {
          label: "IMDb",
          href: `https://www.imdb.com/name/${externalIds.imdb_id}`,
          icon: <FaImdb className="size-4" />,
        }
      : null,
    externalIds?.instagram_id
      ? {
          label: "Instagram",
          href: `https://instagram.com/${externalIds.instagram_id}`,
          icon: <FaInstagram className="size-3.5" />,
        }
      : null,
    externalIds?.twitter_id
      ? {
          label: "X",
          href: `https://x.com/${externalIds.twitter_id}`,
          icon: <FaXTwitter className="size-3.5" />,
        }
      : null,
    externalIds?.tiktok_id
      ? {
          label: "TikTok",
          href: `https://tiktok.com/@${externalIds.tiktok_id.replace(/^@/, "")}`,
          icon: <FaTiktok className="size-3.5" />,
        }
      : null,
    externalIds?.youtube_id
      ? {
          label: "YouTube",
          href: `https://youtube.com/${externalIds.youtube_id}`,
          icon: <FaYoutube className="size-3.5" />,
        }
      : null,
    externalIds?.facebook_id
      ? {
          label: "Facebook",
          href: `https://facebook.com/${externalIds.facebook_id}`,
          icon: <FaFacebook className="size-3.5" />,
        }
      : null,
    person.homepage
      ? {
          label: "Website",
          href: person.homepage,
          icon: <Globe className="size-3.5" />,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
  }>;

  return (
    <section className="relative flex min-h-[64svh] w-full items-end overflow-hidden bg-[#070708] pt-28 pb-10 md:pt-36 md:pb-14">
      {/* Signature Backdrop & Multi-Stop Obsidian Vignettes */}
      <div className="pointer-events-none absolute inset-0 select-none">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            className="object-cover object-top opacity-48"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.08),transparent_42%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/82 to-[#070708]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708]/95 via-[#070708]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 to-transparent" />
      </div>

      {/* Foreground 2-Column Editorial Stage */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex flex-col items-start gap-7 md:flex-row md:items-end md:gap-10 lg:gap-12">
          {/* Framed 2:3 Portrait */}
          <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/15 shadow-[0_28px_70px_-12px_rgba(0,0,0,0.95)] sm:w-48 md:w-56 lg:w-64">
            {portraitUrl ? (
              <Image
                src={portraitUrl}
                alt={person.name}
                fill
                priority
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 256px"
                className="object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-600">
                <User className="size-12 stroke-[1.3]" />
                <span className="px-4 text-center text-xs text-zinc-500">
                  No Portrait
                </span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]" />
          </div>

          {/* Identity, Vitals, Socials & Biography */}
          <div className="min-w-0 max-w-3xl flex-1 space-y-4 sm:space-y-5">
            {/* Craft Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {activeCrafts.map((craft, index) => (
                <span
                  key={craft}
                  className={
                    index === 0
                      ? "glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
                      : "rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-300 backdrop-blur-md"
                  }
                >
                  {craft}
                </span>
              ))}
              {deathYear && (
                <span className="rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-md tabular-nums">
                  {birthYear ? `${birthYear}–${deathYear}` : `Died ${deathYear}`}
                </span>
              )}
            </div>

            {/* Person Name */}
            <h1 className="font-heading text-3xl font-extrabold leading-[1.04] tracking-tight text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.9)] sm:text-5xl lg:text-6xl">
              {person.name}
            </h1>

            {/* Vital Metadata Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-zinc-300 sm:text-sm">
              {age !== null && (
                <span className="inline-flex items-center gap-1.5 tabular-nums text-zinc-200">
                  <Calendar className="size-3.5 text-zinc-400" />
                  {person.deathday ? `Lived ${age} years` : `Age ${age}`}
                </span>
              )}

              {person.place_of_birth && (
                <>
                  {age !== null && <span className="text-zinc-600">·</span>}
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <MapPin className="size-3.5 text-zinc-400" />
                    {person.place_of_birth}
                  </span>
                </>
              )}

              {yearsActiveLabel !== "—" && (
                <>
                  {(age !== null || person.place_of_birth) && (
                    <span className="text-zinc-600">·</span>
                  )}
                  <span className="tabular-nums text-zinc-300">
                    Active {yearsActiveLabel}
                  </span>
                </>
              )}

              {totalCreditsCount > 0 && (
                <>
                  <span className="text-zinc-600">·</span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums text-zinc-300">
                    <Film className="size-3.5 text-zinc-400" />
                    {totalCreditsCount} {totalCreditsCount === 1 ? "credit" : "credits"}
                  </span>
                </>
              )}
            </div>

            {/* Expandable Biography */}
            {bioParagraphs.length > 0 ? (
              <div className="space-y-2 pt-0.5">
                <div
                  className={
                    !bioExpanded && isLongBio
                      ? "space-y-2.5 text-sm leading-relaxed text-zinc-300/95 sm:text-[15px] line-clamp-4"
                      : "space-y-2.5 text-sm leading-relaxed text-zinc-300/95 sm:text-[15px]"
                  }
                >
                  {bioParagraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                {isLongBio && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200 transition-colors hover:text-white cursor-pointer"
                  >
                    {bioExpanded ? (
                      <>
                        Show less <ChevronUp className="size-3.5" />
                      </>
                    ) : (
                      <>
                        Read full biography <ChevronDown className="size-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-zinc-500">
                No biography available for {person.name} yet.
              </p>
            )}

            {/* Monochrome Social & Share Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.label}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/14 bg-white/[0.06] px-3.5 text-xs font-medium text-zinc-200 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.14] hover:text-white active:scale-95"
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/14 bg-white/[0.06] px-3.5 text-xs font-medium text-zinc-200 backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.14] hover:text-white active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span>Link copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="size-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Signature Backdrop Attribution */}
        {heroBackdrop && (
          <div className="mt-6 flex justify-end">
            <Link
              href={heroBackdrop.href}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-md transition-colors hover:border-white/25 hover:text-zinc-200"
            >
              <span>Backdrop · {heroBackdrop.title}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
