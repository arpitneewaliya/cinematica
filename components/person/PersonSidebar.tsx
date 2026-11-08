import Image from "next/image";
import { PersonDetails, PersonExternalIds } from "@/types/tmdb";
import { getImageUrl } from "@/lib/tmdb";
import { Globe, User, MapPin, Calendar, Briefcase, Award } from "lucide-react";
import { FaInstagram, FaXTwitter, FaFacebook, FaImdb } from "react-icons/fa6";

interface PersonSidebarProps {
  person: PersonDetails;
  externalIds?: PersonExternalIds | null;
}

function calculateAge(birthday: string, deathday?: string | null): number {
  const birth = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getGenderLabel(genderCode: number): string {
  switch (genderCode) {
    case 1:
      return "Female";
    case 2:
      return "Male";
    case 3:
      return "Non-binary";
    default:
      return "Not specified";
  }
}

export function PersonSidebar({ person, externalIds }: PersonSidebarProps) {
  const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;

  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
      {/* Profile Picture */}
      <div className="relative aspect-[2/3] w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none mx-auto overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl">
        {person.profile_path ? (
          <Image
            src={getImageUrl(person.profile_path)}
            alt={person.name}
            fill
            priority
            sizes="(max-width: 768px) 320px, 320px"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <User className="w-16 h-16 stroke-1" />
            <span className="text-xs">No Photo Available</span>
          </div>
        )}
      </div>

      {/* Social / External Links Bar */}
      {(externalIds?.imdb_id ||
        externalIds?.instagram_id ||
        externalIds?.twitter_id ||
        externalIds?.facebook_id ||
        person.homepage) && (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
          {externalIds?.imdb_id && (
            <a
              href={`https://www.imdb.com/name/${externalIds.imdb_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="IMDb Profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-amber-400 hover:bg-amber-400 hover:text-black hover:border-amber-400 transition-all duration-200 shadow-md group"
              title="IMDb Profile"
            >
              <FaImdb className="w-5 h-5" />
            </a>
          )}

          {externalIds?.instagram_id && (
            <a
              href={`https://instagram.com/${externalIds.instagram_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-pink-400 hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all duration-200 shadow-md group"
              title="Instagram"
            >
              <FaInstagram className="w-4 h-4" />
            </a>
          )}

          {externalIds?.twitter_id && (
            <a
              href={`https://x.com/${externalIds.twitter_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) Profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-200 shadow-md group"
              title="X (Twitter)"
            >
              <FaXTwitter className="w-4 h-4" />
            </a>
          )}

          {externalIds?.facebook_id && (
            <a
              href={`https://facebook.com/${externalIds.facebook_id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 shadow-md group"
              title="Facebook"
            >
              <FaFacebook className="w-4 h-4" />
            </a>
          )}

          {person.homepage && (
            <a
              href={person.homepage}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Official Website"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-primary hover:bg-primary hover:text-black hover:border-primary transition-all duration-200 shadow-md group"
              title="Official Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {/* Personal Info Box */}
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 md:p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="w-1.5 h-4 bg-primary rounded-full inline-block"></span>
          Personal Info
        </h3>

        <dl className="space-y-4 text-sm">
          {person.known_for_department && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
                <Briefcase className="w-3.5 h-3.5 text-primary/70" />
                Known For
              </dt>
              <dd className="font-medium text-white">{person.known_for_department}</dd>
            </div>
          )}

          {person.gender > 0 && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-primary/70" />
                Gender
              </dt>
              <dd className="font-medium text-white">{getGenderLabel(person.gender)}</dd>
            </div>
          )}

          {person.birthday && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                Birthday
              </dt>
              <dd className="font-medium text-white">
                {formatDate(person.birthday)}
                {age !== null && !person.deathday && (
                  <span className="text-zinc-400 ml-1.5">({age} years old)</span>
                )}
              </dd>
            </div>
          )}

          {person.deathday && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-red-400/80" />
                Date of Death
              </dt>
              <dd className="font-medium text-white">
                {formatDate(person.deathday)}
                {age !== null && (
                  <span className="text-zinc-400 ml-1.5">(at age {age})</span>
                )}
              </dd>
            </div>
          )}

          {person.place_of_birth && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
                <MapPin className="w-3.5 h-3.5 text-primary/70" />
                Place of Birth
              </dt>
              <dd className="font-medium text-white leading-relaxed">
                {person.place_of_birth}
              </dd>
            </div>
          )}

          {person.also_known_as && person.also_known_as.length > 0 && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-primary/70" />
                Also Known As
              </dt>
              <dd className="space-y-1 text-zinc-300">
                {person.also_known_as.slice(0, 4).map((alias, i) => (
                  <div key={i} className="text-xs truncate" title={alias}>
                    {alias}
                  </div>
                ))}
                {person.also_known_as.length > 4 && (
                  <div className="text-[11px] text-zinc-500 italic">
                    +{person.also_known_as.length - 4} more aliases
                  </div>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </aside>
  );
}

