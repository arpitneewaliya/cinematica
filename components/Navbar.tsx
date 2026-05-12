import Link from "next/link";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BiMoviePlay } from "react-icons/bi";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white hover:text-primary transition-colors">
            <BiMoviePlay className="w-6 h-6 text-primary" />
            <span>Cinematica</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/movies" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Movies
            </Link>
            <Link href="/tv" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              TV Shows
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:inline-block">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-105">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
