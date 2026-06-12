"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ onSearchSubmit, autoFocus }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

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
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          autoFocus={autoFocus}
          className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/50 focus:bg-white/10 transition-all duration-300 shadow-inner shadow-black/20"
        />
      </div>
    </form>
  );
}
