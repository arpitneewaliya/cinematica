import { getUserLists } from "@/app/actions/lists";
import { CreateListButton } from "@/components/media/CreateListButton";
import { getImageUrl } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { Folder, ChevronRight, ListMusic, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "My Custom Lists - Cinematica",
  description: "Organize your favorite movies and TV shows into custom themed collections.",
};

export default async function CustomListsPage() {
  const lists = await getUserLists();

  return (
    <main className="min-h-screen bg-background pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="w-2 h-10 bg-primary rounded-full inline-block"></span>
              My Custom Lists
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1">
              Create and manage collections of movies and TV shows.
            </p>
          </div>
          <CreateListButton />
        </div>

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/10">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
              <Folder className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Create your first custom list</h2>
            <p className="text-muted-foreground text-sm max-w-sm mb-6">
              Group your favorite media into folders like "All-time Favorites" or "To Watch with Friends".
            </p>
            <CreateListButton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {lists.map((list) => {
              const itemCount = list._count.items;
              const previewItems = list.items || [];

              return (
                <Link key={list.id} href={`/lists/${list.id}`}>
                  <Card className="group bg-zinc-900/20 border-white/5 hover:border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 cursor-pointer h-full flex flex-col justify-between overflow-hidden">
                    <CardContent className="p-4 flex flex-col gap-4">
                      {/* Collage Preview */}
                      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/5 flex shadow-inner">
                        {itemCount === 0 ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-white/5 to-transparent text-gray-600 select-none">
                            <Folder className="w-10 h-10 stroke-[1.5]" />
                            <span className="text-xs font-semibold">Empty List</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0.5">
                            {[0, 1, 2, 3].map((idx) => {
                              const item = previewItems[idx];
                              return (
                                <div key={idx} className="relative w-full h-full bg-white/5">
                                  {item?.posterPath ? (
                                    <Image
                                      src={getImageUrl(item.posterPath)}
                                      alt="Poster preview"
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                                      sizes="(max-width: 768px) 50vw, 150px"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-zinc-900/60" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {/* Overlay Item Count Badge */}
                        <div className="absolute bottom-2.5 left-2.5">
                          <Badge className="bg-black/85 backdrop-blur-md border border-white/10 text-white font-bold select-none text-[10px] md:text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg">
                            <Layers className="w-3.5 h-3.5 text-primary" />
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </Badge>
                        </div>
                      </div>

                      {/* List Info */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-white text-base md:text-lg truncate group-hover:text-primary transition-colors flex items-center justify-between">
                          {list.name}
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
                        </h3>
                        {list.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {list.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
