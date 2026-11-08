"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PersonBioProps {
  biography?: string;
  name: string;
}

export function PersonBio({ biography, name }: PersonBioProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isLong = React.useMemo(() => (biography ? biography.length > 500 : false), [biography]);

  if (!biography || biography.trim().length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-zinc-400 italic">
        We don&apos;t have a biography for {name} yet.
      </div>
    );
  }

  const paragraphs = biography.split("\n\n").filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          className={`space-y-3.5 text-sm sm:text-base leading-relaxed text-zinc-300 transition-all duration-300 ${
            !isExpanded && isLong ? "max-h-48 overflow-hidden" : ""
          }`}
        >
          {paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
        </div>

        {!isExpanded && isLong && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
        )}
      </div>

      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 gap-1.5 -ml-2"
        >
          {isExpanded ? (
            <>
              Read less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="w-4 h-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}

