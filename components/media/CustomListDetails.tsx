"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft, Layers, Calendar, Star, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { removeFromList, deleteCustomList } from "@/app/actions/lists";
import { getImageUrl } from "@/lib/tmdb";

interface ListItem {
  id: string;
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
}

interface CustomListDetailsProps {
  list: {
    id: string;
    name: string;
    description: string | null;
    items: ListItem[];
  };
}

export function CustomListDetails({ list }: CustomListDetailsProps) {
  const [items, setItems] = useState<ListItem[]>(list.items);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRemoveItem = (mediaId: number, mediaType: "movie" | "tv", title: string) => {
    if (!confirm(`Remove "${title}" from this list?`)) {
      return;
    }

    startTransition(async () => {
      // Optimistic update
      setItems((prev) => prev.filter((item) => !(item.mediaId === mediaId && item.mediaType === mediaType)));
      const res = await removeFromList(list.id, mediaId, mediaType);
      if (!res.success) {
        alert(res.error || "Failed to remove item");
        window.location.reload();
      }
    });
  };

  const handleDeleteList = () => {
    if (!confirm(`Are you sure you want to delete the list "${list.name}"? This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCustomList(list.id);
      if (res.success) {
        router.push("/lists");
        router.refresh();
      } else {
        alert(res.error || "Failed to delete list");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Navigation & Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/lists"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lists
        </Link>
        <Button
          variant="ghost"
          onClick={handleDeleteList}
          disabled={isPending}
          className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full px-5 py-2.5 h-auto text-sm transition-colors flex items-center gap-2 cursor-pointer font-semibold"
        >
          <Trash2 className="w-4 h-4" /> Delete List
        </Button>
      </div>

      {/* List Meta Card */}
      <div className="p-6 md:p-8 bg-zinc-900/20 border border-white/5 rounded-2xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {list.name}
            </h1>
            {list.description && (
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl font-medium">
                {list.description}
              </p>
            )}
          </div>
          <Badge className="bg-primary/20 text-primary border-none select-none text-xs md:text-sm px-4 py-1.5 rounded-full flex items-center gap-2 w-fit">
            <Layers className="w-4 h-4" /> {items.length} {items.length === 1 ? "Item" : "Items"}
          </Badge>
        </div>
      </div>

      {/* Grid of Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/10">
          <Layers className="w-12 h-12 text-gray-600 mb-4 stroke-[1.5]" />
          <h2 className="text-lg font-semibold text-white mb-1">This list is empty</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Browse movies and shows, click "Add to List", and save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {items.map((item) => {
            const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : "";

            return (
              <div key={item.id} className="relative group/card">
                {/* Remove from List Overlay Button */}
                <button
                  onClick={() => handleRemoveItem(item.mediaId, item.mediaType, item.title)}
                  disabled={isPending}
                  className="absolute top-2 left-2 z-30 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-gray-400 hover:text-red-400 hover:bg-black/90 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/card:opacity-100 shadow-lg cursor-pointer"
                  title="Remove from list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/${item.mediaType}/${item.mediaId}`}>
                  <Card className="group relative overflow-hidden rounded-xl bg-card/50 border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 cursor-pointer h-full">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-white/5">
                      {item.posterPath ? (
                        <Image
                          src={getImageUrl(item.posterPath)}
                          alt={item.title || "Poster"}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                          Poster N/A
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-85" />
                    </div>

                    <CardContent className="absolute bottom-0 w-full p-3 transform translate-y-1.5 transition-transform duration-300 group-hover:translate-y-0">
                      <h3 className="font-bold text-sm md:text-base text-white truncate drop-shadow-md">
                        {item.title}
                      </h3>
                      <p className="text-[10px] md:text-xs text-gray-300 font-semibold flex items-center gap-1 select-none mt-0.5">
                        {item.mediaType === "movie" ? (
                          <Film className="w-3 h-3 text-gray-400" />
                        ) : (
                          <Tv className="w-3 h-3 text-gray-400" />
                        )}
                        <span>{year} • {item.mediaType === "movie" ? "Movie" : "TV"}</span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
