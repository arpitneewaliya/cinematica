"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { Video } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface TrailerModalProps {
  video: Video;
  className?: string;
}

export function TrailerModal({ video, className }: TrailerModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!video || video.site !== "YouTube") return null;

  return (
    <>
      <Button
        type="button"
        size="default"
        className={cn(
          "bg-white text-black hover:bg-zinc-200 gap-2 font-semibold rounded-full px-6 shadow-[0_8px_30px_rgba(255,255,255,0.18)] transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Play className="size-4 fill-current" />
        Watch Trailer
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-3 sm:p-6 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={video.name || "Trailer player"}
            className="relative w-full max-w-5xl aspect-video rounded-2xl border border-white/15 bg-black shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute -top-12 right-0 z-50 rounded-full size-10 border-white/15 bg-white/10 hover:bg-white hover:text-black text-white backdrop-blur-md cursor-pointer transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close trailer"
            >
              <X className="size-5" />
            </Button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.key}?autoplay=1`}
              title={video.name || "Trailer"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-2xl border-0"
            />
          </div>
        </div>
      )}
    </>
  );
}
