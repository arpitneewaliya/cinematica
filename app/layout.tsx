import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cinematica - Movie & TV Tracker",
  description: "Track the movies and TV shows you have watched, rate them, write review notes, and organize them in custom lists.",
  openGraph: {
    title: "Cinematica - Movie & TV Tracker",
    description: "Track the movies and TV shows you have watched, rate them, write review notes, and organize them in custom lists.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cinematica Social Share Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cinematica - Movie & TV Tracker",
    description: "Track the movies and TV shows you have watched, rate them, write review notes, and organize them in custom lists.",
    images: ["/og-image.png"],
  },
};

import { Navbar } from "@/components/Navbar";
import { ClerkProvider } from '@clerk/nextjs';
import { CountryProvider } from "@/components/providers/CountryProvider";
import { WatchlistProvider } from "@/components/providers/WatchlistProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col">
          <CountryProvider>
            <WatchlistProvider>
              <Navbar />
              {children}
            </WatchlistProvider>
          </CountryProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
