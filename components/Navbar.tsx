"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BiMoviePlay } from "react-icons/bi";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Bookmark, Film, Tv, Menu, X, Search } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function Navbar() {
  const { userId } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 md:gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-br from-primary to-primary/40 border border-primary/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] group-hover:-rotate-6 group-hover:scale-105">
              <BiMoviePlay className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:to-gray-200 transition-colors duration-300">
              Cinematica
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/movies" 
              className="relative px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-300 group flex items-center gap-2 rounded-full hover:bg-white/5"
            >
              <Film className="w-4 h-4 transition-transform group-hover:scale-110" />
              Movies
            </Link>
            <Link 
              href="/tv" 
              className="relative px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-300 group flex items-center gap-2 rounded-full hover:bg-white/5"
            >
              <Tv className="w-4 h-4 transition-transform group-hover:scale-110" />
              TV Shows
            </Link>
          </div>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:block mr-2">
            <SearchBar />
          </div>

          {userId ? (
            <>
              <Link 
                href="/watchlist" 
                className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-all duration-300 rounded-full hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 mr-2"
              >
                <Bookmark className="w-4 h-4" />
                Watchlist
              </Link>
              <div className="p-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center">
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 md:w-9 md:h-9 rounded-full" } }} />
              </div>
            </>
          ) : (
            <>
              <div className="hidden sm:inline-block">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-6 transition-all duration-300">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
              <SignUpButton mode="modal">
                <Button className="relative overflow-hidden rounded-full font-bold px-5 md:px-8 text-xs md:text-sm bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] group">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </SignUpButton>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/80 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {/* Mobile Search */}
            <div className="lg:hidden mb-2">
              <SearchBar />
            </div>

            <Link
              href="/movies"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Film className="w-5 h-5" />
              Movies
            </Link>
            <Link
              href="/tv"
              className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Tv className="w-5 h-5" />
              TV Shows
            </Link>
            {userId && (
              <Link
                href="/watchlist"
                className="sm:hidden flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bookmark className="w-5 h-5" />
                Watchlist
              </Link>
            )}
            {!userId && (
              <div className="sm:hidden pt-2 border-t border-white/5">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="w-full justify-start text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl px-4 py-3 h-auto">
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
