"use client";

import { useState, useEffect } from "react";
import { X, FolderPlus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getUserLists,
  createCustomList,
  addToList,
  removeFromList,
  checkItemInLists,
} from "@/app/actions/lists";
import { cn } from "@/lib/utils";

interface AddToCustomListModalProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  onClose: () => void;
}

interface ListWithCount {
  id: string;
  name: string;
  description: string | null;
  _count: { items: number };
}

export function AddToCustomListModal({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  releaseDate,
  onClose,
}: AddToCustomListModalProps) {
  const [lists, setLists] = useState<ListWithCount[]>([]);
  const [activeListIds, setActiveListIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [userLists, itemLists] = await Promise.all([
          getUserLists(),
          checkItemInLists(mediaId, mediaType),
        ]);
        if (active) {
          setLists(userLists);
          setActiveListIds(itemLists);
        }
      } catch (err) {
        console.error("Failed to load list details:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [mediaId, mediaType]);

  const handleToggleList = async (listId: string) => {
    setActionError(null);
    const isAlreadyInList = activeListIds.includes(listId);

    setActiveListIds((prev) =>
      isAlreadyInList ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              _count: {
                items: Math.max(0, l._count.items + (isAlreadyInList ? -1 : 1)),
              },
            }
          : l
      )
    );

    if (isAlreadyInList) {
      const res = await removeFromList(listId, mediaId, mediaType);
      if (!res.success) {
        setActiveListIds((prev) => [...prev, listId]);
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId ? { ...l, _count: { items: l._count.items + 1 } } : l
          )
        );
        setActionError(res.error || "Failed to remove from list");
      }
    } else {
      const res = await addToList(listId, {
        mediaId,
        mediaType,
        title,
        posterPath,
        backdropPath,
        releaseDate,
      });
      if (!res.success) {
        setActiveListIds((prev) => prev.filter((id) => id !== listId));
        setLists((prev) =>
          prev.map((l) =>
            l.id === listId
              ? { ...l, _count: { items: Math.max(0, l._count.items - 1) } }
              : l
          )
        );
        setActionError(res.error || "Failed to add to list");
      }
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setCreateError(null);
    setIsCreating(true);

    try {
      const res = await createCustomList(newListName, newListDesc);
      if (res.success && res.list) {
        setNewListName("");
        setNewListDesc("");
        setShowCreateForm(false);
        const freshLists = await getUserLists();
        setLists(freshLists);
        await handleToggleList(res.list.id);
      } else {
        setCreateError(res.error || "Failed to create list");
      }
    } catch {
      setCreateError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/82 p-4 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-list-title"
        className="glass-panel relative w-full max-w-md rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] shrink-0">
          <div className="min-w-0 pr-4">
            <h3 id="add-to-list-title" className="font-heading text-lg font-bold text-white">
              Add to Lists
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              Save &ldquo;{title}&rdquo; to your collections
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-zinc-400 transition-colors hover:bg-white/12 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 hide-scrollbar">
          {actionError && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
              {actionError}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="size-7 text-white animate-spin" />
              <p className="text-xs text-zinc-400">Loading your lists...</p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {lists.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/12 rounded-2xl">
                    <p className="text-sm text-zinc-300 font-medium mb-1">
                      No custom lists yet
                    </p>
                    <p className="text-xs text-zinc-500">
                      Create one below to start organizing titles
                    </p>
                  </div>
                ) : (
                  lists.map((list) => {
                    const isChecked = activeListIds.includes(list.id);
                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => handleToggleList(list.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none",
                          isChecked
                            ? "bg-white/12 border-white/30 text-white"
                            : "bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] hover:border-white/16"
                        )}
                      >
                        <div className="flex-1 pr-4 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{list.name}</p>
                            <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-zinc-400 tabular-nums">
                              {list._count.items}
                            </span>
                          </div>
                          {list.description && (
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              {list.description}
                            </p>
                          )}
                        </div>
                        <div
                          className={cn(
                            "size-5 shrink-0 rounded-md flex items-center justify-center border transition-all",
                            isChecked
                              ? "bg-white border-white text-black"
                              : "border-zinc-500 bg-transparent"
                          )}
                        >
                          {isChecked && <Check className="size-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/18 rounded-2xl text-xs sm:text-sm font-medium text-zinc-400 hover:text-white hover:border-white/35 hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <FolderPlus className="size-4" /> Create New List
                </button>
              ) : (
                <form
                  onSubmit={handleCreateList}
                  className="space-y-3.5 p-4 bg-white/[0.04] rounded-2xl border border-white/12 animate-in slide-in-from-top-2 duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                      New Collection
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  {createError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-lg">
                      {createError}
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="List Name (e.g., Midnight Sci-Fi)"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    maxLength={50}
                    className="w-full bg-black/40 border border-white/12 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-white/35 transition-colors placeholder-zinc-500"
                    required
                  />

                  <textarea
                    placeholder="Description (Optional)"
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    rows={2}
                    maxLength={150}
                    className="w-full bg-black/40 border border-white/12 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-white/35 transition-colors resize-none placeholder-zinc-500"
                  />

                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-semibold text-xs py-2.5 h-auto rounded-full active:scale-98 transition-all cursor-pointer"
                  >
                    {isCreating ? (
                      <Loader2 className="size-4 animate-spin mx-auto" />
                    ) : (
                      "Create & Save Item"
                    )}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] shrink-0 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="h-9 rounded-full bg-white hover:bg-zinc-200 text-black font-semibold px-6 text-xs sm:text-sm active:scale-95 transition-all cursor-pointer"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
