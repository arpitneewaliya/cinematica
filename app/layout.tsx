import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col">
          <CountryProvider>
            <Navbar />
            {children}
          </CountryProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
