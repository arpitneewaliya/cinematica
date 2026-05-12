import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BiMoviePlay } from "react-icons/bi";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Bookmark, Film, Tv } from "lucide-react";
import { SearchBar } from "./SearchBar";

export async function Navbar() {
  const { userId } = await auth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8 md:gap-12">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/40 border border-primary/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] group-hover:-rotate-6 group-hover:scale-105">
              <BiMoviePlay className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent group-hover:to-gray-200 transition-colors duration-300">
              Cinematica
            </span>
          </Link>

          {/* Links */}
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
        <div className="flex items-center gap-3">
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
                <UserButton appearance={{ elements: { avatarBox: "w-9 h-9 rounded-full" } }} />
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
                <Button className="relative overflow-hidden rounded-full font-bold px-8 bg-white text-black hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] group">
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
