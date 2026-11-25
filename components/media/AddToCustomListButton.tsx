"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import { AddToCustomListModal } from "./AddToCustomListModal";
import { useAuth, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface AddToCustomListButtonProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  className?: string;
}

export function AddToCustomListButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  className,
}: AddToCustomListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const handleOpen = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpen}
        className={cn(
          "gap-2 rounded-full border-white/15 bg-white/[0.07] px-5 font-semibold text-white backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:bg-white/[0.14] hover:text-white active:scale-95 cursor-pointer",
          className
        )}
      >
        <ListPlus className="size-4 text-zinc-300" />
        Add to List
      </Button>

      {isOpen && (
        <AddToCustomListModal
          mediaId={mediaId}
          mediaType={mediaType}
          title={title}
          posterPath={posterPath}
          backdropPath={backdropPath}
          releaseDate={releaseDate}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
