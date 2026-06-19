"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ onSearchSubmit, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [kbdText, setKbdText] = useState("Ctrl+K");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Detect OS to show appropriate shortcut hint
    if (typeof navigator !== "undefined") {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if (isMac) {
        setTimeout(() => {
          setKbdText("⌘K");
        }, 0);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-center w-full max-w-full lg:max-w-[200px] xl:max-w-xs transition-all duration-300"
    >
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          autoFocus={autoFocus}
          className="w-full h-10 pl-10 pr-14 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 focus:bg-white/10 transition-all duration-300 shadow-inner shadow-black/20"
        />
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none group-focus-within:opacity-0 transition-opacity duration-300">
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
            {kbdText}
          </kbd>
        </div>
      </div>
    </form>
  );
}
