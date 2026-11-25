"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import {
  Bookmark,
  Film,
  Tv,
  Menu,
  X,
  Search,
  Eye,
  ListPlus,
  ChevronDown,
  Library,
  Compass,
} from "lucide-react";
import { SearchModal } from "./media/SearchModal";
import { motion, AnimatePresence } from "framer-motion";
import { useCountry, COUNTRIES } from "@/components/providers/CountryProvider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { userId } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [kbdText, setKbdText] = useState("Ctrl K");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { country, setCountry } = useCountry();
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsCountryOpen(false);
  }

  const isHome = pathname === "/";
  const hasFullBleedHero =
    isHome ||
    pathname === "/movies" ||
    pathname === "/tv" ||
    pathname.startsWith("/movie/") ||
    pathname.startsWith("/tv/") ||
    pathname.startsWith("/person/");
  const isMoviesRoute = pathname.startsWith("/movies") || pathname.startsWith("/movie/");
  const isTvRoute = pathname.startsWith("/tv");
  const isLibraryRoute =
    pathname.startsWith("/watched") ||
    pathname.startsWith("/lists") ||
    pathname.startsWith("/watchlist");

  const showFloatingCapsule = !hasFullBleedHero || isScrolled || mobileMenuOpen;

  useEffect(() => {
    const updateScrolledState = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener("scroll", updateScrolledState, { passive: true });
    requestAnimationFrame(updateScrolledState);

    return () => window.removeEventListener("scroll", updateScrolledState);
  }, [pathname]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      if (isMac) {
        setTimeout(() => setKbdText("⌘K"), 0);
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Compass, active: isHome },
    { href: "/movies", label: "Movies", icon: Film, active: isMoviesRoute },
    { href: "/tv", label: "Series", icon: Tv, active: isTvRoute },
  ];

  return (
    <>
      <header
        className={cn(
          "inset-x-0 top-0 z-50 w-full pointer-events-none transition-all duration-500",
          hasFullBleedHero ? "fixed" : "sticky",
          showFloatingCapsule ? "px-3 pt-2.5 sm:px-6 md:pt-3.5" : "px-4 pt-3 sm:px-6 md:px-10 md:pt-5"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto mx-auto flex items-center justify-between transition-all duration-500",
            showFloatingCapsule
              ? "h-14 max-w-6xl rounded-full border border-white/12 bg-zinc-950/78 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_50px_-10px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:h-15 md:px-6"
              : "container h-14 border border-transparent bg-transparent px-1 md:h-16 md:px-2"
          )}
        >
          {/* Left: Brand & Primary Links */}
          <div className="flex items-center gap-4 lg:gap-8">
            <Link
              href="/"
              className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
            >
              <span className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:scale-105">
                <span className="size-2.5 rounded-full bg-white" />
              </span>
              <span className="font-heading text-lg font-extrabold tracking-tight text-white md:text-xl">
                Cinematica
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden md:flex items-center gap-1">
              {navItems.map(({ href, label, icon: Icon, active }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95",
                    active
                      ? "bg-white/14 text-white ring-1 ring-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                      : "text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <Icon className="size-3.5 opacity-85" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search, Region, Library, Auth */}
          <div className="flex items-center gap-2">
            {/* Desktop Search Trigger */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="group hidden lg:flex h-9 w-56 xl:w-68 items-center justify-between rounded-full border border-white/12 bg-white/[0.05] pl-3.5 pr-2.5 text-left text-xs text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 hover:border-white/25 hover:bg-white/[0.09] hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="size-3.5 text-zinc-400 transition-colors group-hover:text-white" />
                <span className="truncate">Search films, series...</span>
              </span>
              <kbd className="inline-flex h-5 shrink-0 select-none items-center rounded-full border border-white/12 bg-white/[0.07] px-2 font-mono text-[10px] font-medium text-zinc-300 transition-colors group-hover:border-white/20 group-hover:text-white">
                {kbdText}
              </kbd>
            </button>

            {/* Compact Search Trigger (< lg) */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-zinc-300 transition-all duration-200 hover:border-white/25 hover:bg-white/12 hover:text-white active:scale-95 cursor-pointer"
              aria-label="Open search"
            >
              <Search className="size-4" />
            </button>

            {/* Country Switcher */}
            <div className="relative" ref={countryRef}>
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-2.5 md:px-3 text-xs font-medium text-zinc-300 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95 cursor-pointer"
                aria-label="Switch streaming country"
                aria-expanded={isCountryOpen}
                aria-haspopup="true"
              >
                <span className="text-sm leading-none">
                  {COUNTRIES.find((c) => c.code === country)?.flag || "🇺🇸"}
                </span>
                <span className="hidden sm:inline uppercase text-[11px] text-zinc-300 tabular-nums">
                  {country}
                </span>
                <ChevronDown
                  className={cn(
                    "size-3 text-zinc-400 transition-transform duration-200",
                    isCountryOpen && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {isCountryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="glass-panel absolute right-0 top-full mt-2.5 z-50 flex max-h-72 w-48 flex-col gap-0.5 overflow-y-auto rounded-2xl p-1.5 hide-scrollbar"
                  >
                    {COUNTRIES.map((c) => {
                      const selected = country === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountry(c.code);
                            setIsCountryOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer",
                            selected
                              ? "bg-white/14 text-white"
                              : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </span>
                          {selected && <span className="size-1.5 rounded-full bg-white" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {userId ? (
              <>
                {/* Desktop Library Dropdown */}
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={cn(
                      "flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs md:text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer",
                      isLibraryRoute || isDropdownOpen
                        ? "bg-white/14 text-white ring-1 ring-white/18"
                        : "text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                    )}
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    <Library className="size-3.5 opacity-85" />
                    <span>Library</span>
                    <ChevronDown
                      className={cn(
                        "size-3 text-zinc-400 transition-transform duration-200",
                        isDropdownOpen && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="glass-panel absolute right-0 top-full mt-2.5 z-50 flex w-48 flex-col gap-0.5 rounded-2xl p-1.5"
                      >
                        {[
                          { href: "/watchlist", label: "Watchlist", icon: Bookmark },
                          { href: "/watched", label: "Watched", icon: Eye },
                          { href: "/lists", label: "Custom Lists", icon: ListPlus },
                        ].map(({ href, label, icon: Icon }) => {
                          const active = pathname.startsWith(href);
                          return (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setIsDropdownOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs md:text-sm font-medium transition-colors",
                                active
                                  ? "bg-white/14 text-white"
                                  : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                              )}
                            >
                              <Icon className="size-4 text-zinc-400" />
                              {label}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] p-0.5 transition-colors hover:border-white/30">
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "w-7 h-7 md:w-8 md:h-8 rounded-full" },
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="hidden sm:inline-block">
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      className="h-9 rounded-full px-4 text-xs md:text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                </div>
                <SignUpButton mode="modal">
                  <Button className="h-9 rounded-full bg-white px-4 md:px-5 text-xs md:text-sm font-semibold text-black hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer">
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden flex size-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-zinc-300 transition-all hover:bg-white/12 hover:text-white active:scale-95 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Animated Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto fixed inset-0 -z-10 bg-black/60 backdrop-blur-xs md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                id="mobile-navigation"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="glass-panel pointer-events-auto mx-auto mt-2 max-w-6xl rounded-3xl p-3 md:hidden"
              >
                <div className="flex flex-col gap-1">
                  {navItems.map(({ href, label, icon: Icon, active }) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                        active
                          ? "bg-white/14 text-white"
                          : "text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                      )}
                    >
                      <Icon className="size-4 text-zinc-400" />
                      {label}
                    </Link>
                  ))}

                  {userId ? (
                    <div className="mt-1 border-t border-white/10 pt-2 flex flex-col gap-1">
                      <span className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                        Your Library
                      </span>
                      {[
                        { href: "/watchlist", label: "Watchlist", icon: Bookmark },
                        { href: "/watched", label: "Watched History", icon: Eye },
                        { href: "/lists", label: "Custom Lists", icon: ListPlus },
                      ].map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                            pathname.startsWith(href)
                              ? "bg-white/14 text-white"
                              : "text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                          )}
                        >
                          <Icon className="size-4 text-zinc-400" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="sm:hidden mt-1 border-t border-white/10 pt-2">
                      <SignInButton mode="modal">
                        <Button
                          variant="ghost"
                          className="w-full justify-start rounded-2xl px-4 py-3 h-auto text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          Sign In
                        </Button>
                      </SignInButton>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal rendered outside backdrop-blur header so fixed positioning spans full viewport */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
