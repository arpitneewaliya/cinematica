"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Plus, FolderPlus, ListPlus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserLists, createCustomList, addToList, removeFromList, checkItemInLists } from "@/app/actions/lists";

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
  const [isPending, startTransition] = useTransition();

  // Create list form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [userLists, itemLists] = await Promise.all([
          getUserLists(),
          checkItemInLists(mediaId, mediaType),
        ]);
        setLists(userLists as any);
        setActiveListIds(itemLists);
      } catch (err) {
        console.error("Failed to load list details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [mediaId, mediaType]);

  const handleToggleList = (listId: string) => {
    const isAlreadyInList = activeListIds.includes(listId);

    // Optimistically update UI
    setActiveListIds(prev =>
      isAlreadyInList ? prev.filter((id) => id !== listId) : [...prev, listId]
    );

    startTransition(async () => {
      if (isAlreadyInList) {
        const res = await removeFromList(listId, mediaId, mediaType);
        if (!res.success) {
          // Revert state
          setActiveListIds(prev => [...prev, listId]);
          alert(res.error || "Failed to remove from list");
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
          // Revert state
          setActiveListIds(prev => prev.filter((id) => id !== listId));
          alert(res.error || "Failed to add to list");
        }
      }
    });
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
        // Refresh lists
        const freshLists = await getUserLists();
        setLists(freshLists as any);
        // Automatically add to the newly created list
        handleToggleList(res.list.id);
      } else {
        setCreateError(res.error || "Failed to create list");
      }
    } catch (err) {
      setCreateError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-zinc-950/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Add to Lists</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px] font-medium">
              Save "{title}" to your collections
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area - scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-gray-400">Loading your lists...</p>
            </div>
          ) : (
            <>
              {/* Lists Checklist */}
              <div className="space-y-3">
                {lists.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                    <p className="text-sm text-gray-500 font-medium mb-1">No custom lists found</p>
                    <p className="text-xs text-gray-600">Create one below to get started</p>
                  </div>
                ) : (
                  lists.map((list) => {
                    const isChecked = activeListIds.includes(list.id);
                    return (
                      <div
                        key={list.id}
                        onClick={() => handleToggleList(list.id)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isChecked
                            ? "bg-primary/5 border-primary/30 text-white"
                            : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10"
                        }`}
                      >
                        <div className="flex-1 pr-4 min-w-0">
                          <p className="text-sm font-semibold truncate">{list.name}</p>
                          {list.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {list.description}
                            </p>
                          )}
                        </div>
                        <div 
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-gray-500"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Inline Create List Form Toggle */}
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:border-white/40 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" /> Create New List
                </button>
              ) : (
                <form onSubmit={handleCreateList} className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10 animate-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">New List Details</span>
                    <button 
                      type="button" 
                      onClick={() => setShowCreateForm(false)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {createError && (
                    <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                      {createError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="List Name (e.g., Summer Classics)"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      maxLength={50}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <textarea
                      placeholder="Description (Optional)"
                      value={newListDesc}
                      onChange={(e) => setNewListDesc(e.target.value)}
                      rows={2}
                      maxLength={150}
                      className="w-full bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-white hover:bg-gray-100 text-black font-semibold text-xs py-2 h-auto rounded-lg active:scale-98 transition-transform"
                  >
                    {isCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
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
        <div className="p-6 border-t border-white/5 shrink-0 flex justify-end bg-zinc-950/20">
          <Button
            onClick={onClose}
            className="rounded-full bg-white hover:bg-gray-100 text-black font-bold px-6 py-2.5 text-sm active:scale-95 transition-transform"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
