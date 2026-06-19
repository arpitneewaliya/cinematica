"use client";

import { useState } from "react";
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

  if (!video || video.site !== "YouTube") return null;

  return (
    <>
      <Button
        size="default"
        className={cn(
          "bg-white text-black hover:bg-white/90 gap-2 font-semibold rounded-full px-5 md:px-8 text-sm md:text-base transition-transform hover:scale-105",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
        Watch Trailer
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl shadow-primary/20 ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.key}?autoplay=1`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
