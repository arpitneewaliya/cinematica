"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Bookmark, Film, Tv, Menu, X, Search, Eye, ListPlus, ChevronDown, Library } from "lucide-react";
import { SearchModal } from "./media/SearchModal";
import { motion, AnimatePresence } from "framer-motion";
import { useCountry, COUNTRIES } from "@/components/providers/CountryProvider";

export function Navbar() {
  const { userId } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [kbdText, setKbdText] = useState("Ctrl+K");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { country, setCountry } = useCountry();
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setIsCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if (isMac) {
        setTimeout(() => {
          setKbdText("⌘K");
        }, 0);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Open modal on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 md:gap-3">
            <span className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:to-gray-200 transition-colors duration-300">
              Cinematica
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/movies"
              className="relative px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group flex items-center gap-2 rounded-full hover:bg-white/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95"
            >
              <Film className="w-4 h-4 transition-transform group-hover:scale-110" />
              Movies
            </Link>
            <Link
              href="/tv"
              className="relative px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 group flex items-center gap-2 rounded-full hover:bg-white/10 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-95"
            >
              <Tv className="w-4 h-4 transition-transform group-hover:scale-110" />
              TV Shows
            </Link>
          </div>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block mr-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative flex items-center w-full lg:w-80 xl:w-[420px] transition-all duration-300 group cursor-pointer text-left focus:outline-none"
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-hover:text-primary transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <div className="w-full h-10 pl-10 pr-14 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-400 flex items-center group-hover:bg-white/10 group-hover:border-primary/50 transition-all duration-300 shadow-inner shadow-black/20">
                  Search movies, TV shows...
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                    {kbdText}
                  </kbd>
                </div>
              </div>
            </button>
          </div>

          <div className="lg:hidden mr-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-90 cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Country Switcher */}
          <div className="relative z-50 mr-1" ref={countryRef}>
            <button
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 rounded-full hover:bg-white/5 border border-white/10 hover:border-white/20 active:scale-95 cursor-pointer"
              aria-label="Switch streaming country"
              aria-expanded={isCountryOpen}
              aria-haspopup="true"
            >
              <span className="text-base leading-none">
                {COUNTRIES.find((c) => c.code === country)?.flag || "🇺🇸"}
              </span>
              <span className="hidden xs:inline uppercase text-[10px] md:text-xs text-zinc-400 font-medium">
                {country}
              </span>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-300 ${isCountryOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isCountryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-48 max-h-72 overflow-y-auto rounded-2xl bg-zinc-950/95 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 flex flex-col gap-1 hide-scrollbar"
                >
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountry(c.code);
                        setIsCountryOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3.5 py-2 text-xs font-semibold rounded-xl text-left transition-all duration-200 cursor-pointer ${
                        country === c.code
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      {country === c.code && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {userId ? (
            <>
              {/* Desktop Library Dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 rounded-full hover:bg-white/10 border border-transparent hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] mr-2 active:scale-95 cursor-pointer group"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <Library className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors" />
                  <span>Library</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-2 top-full mt-2 w-52 rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 flex flex-col gap-1"
                    >
                      <Link
                        href="/watched"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/5 active:scale-98 group"
                      >
                        <Eye className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors duration-200" />
                        Watched
                      </Link>
                      <Link
                        href="/lists"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/5 active:scale-98 group"
                      >
                        <ListPlus className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors duration-200" />
                        Lists
                      </Link>
                      <Link
                        href="/watchlist"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 rounded-xl hover:bg-white/5 active:scale-98 group"
                      >
                        <Bookmark className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors duration-200" />
                        Watchlist
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-[3px] rounded-full bg-gradient-to-tr from-white/5 to-white/20 border border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 active:scale-95 flex items-center justify-center">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 md:w-9 md:h-9 rounded-full" } }} />
              </div>
            </>
          ) : (
            <>
              <div className="hidden sm:inline-block">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-6 py-2 h-auto border border-transparent hover:border-white/10 transition-all duration-300 active:scale-95">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
              <SignUpButton mode="modal">
                <Button className="relative overflow-hidden rounded-full font-bold px-6 md:px-8 py-2 h-auto text-xs md:text-sm bg-white text-black hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] group border border-white/20">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </SignUpButton>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-90 ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Search Modal (Ctrl+K Command Palette) */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-3xl animate-in slide-in-from-top-2 duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
            <Link
              href="/movies"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 hover:pl-6 transition-all duration-300 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Film className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              Movies
            </Link>
            <Link
              href="/tv"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 hover:pl-6 transition-all duration-300 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Tv className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              TV Shows
            </Link>
            {userId && (
              <>
                <Link
                  href="/watched"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 hover:pl-6 transition-all duration-300 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Watched
                </Link>
                <Link
                  href="/lists"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 hover:pl-6 transition-all duration-300 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListPlus className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Lists
                </Link>
                <Link
                  href="/watchlist"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 hover:pl-6 transition-all duration-300 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  Watchlist
                </Link>
              </>
            )}
            {!userId && (
              <div className="sm:hidden pt-4 mt-2 border-t border-white/10">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="w-full justify-start text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 hover:pl-6 rounded-xl px-4 py-3 h-auto transition-all duration-300">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
