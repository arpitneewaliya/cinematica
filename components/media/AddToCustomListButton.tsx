"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import { AddToCustomListModal } from "./AddToCustomListModal";
import { useAuth } from "@clerk/nextjs";

interface AddToCustomListButtonProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
}

export function AddToCustomListButton({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
}: AddToCustomListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const handleOpen = () => {
    if (!isSignedIn) {
      alert("Please sign in to add items to lists");
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="gap-2 font-semibold rounded-full px-6 bg-background/20 hover:bg-background/40 backdrop-blur-md border-white/20 text-white hover:scale-[1.02] active:scale-95 transition-all duration-300"
      >
        <ListPlus className="w-5 h-5 text-gray-300" />
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
