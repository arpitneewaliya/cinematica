"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Bookmark, Film, Tv, Menu, X, Search } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function Navbar() {
  const { userId } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
            <SearchBar />
          </div>

          <div className="lg:hidden mr-1">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 active:scale-90"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {userId ? (
            <>
              <Link 
                href="/watchlist" 
                className="hidden sm:flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 rounded-full hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] mr-2 active:scale-95"
              >
                <Bookmark className="w-4 h-4" />
                Watchlist
              </Link>
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

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center px-4 gap-3 lg:hidden animate-in fade-in duration-200">
          <SearchBar autoFocus onSearchSubmit={() => setMobileSearchOpen(false)} />
          <button 
            onClick={() => setMobileSearchOpen(false)} 
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-300 active:scale-90"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

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
              <Link
                href="/watchlist"
                className="sm:hidden flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/10 hover:pl-6 transition-all duration-300 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                Watchlist
              </Link>
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
