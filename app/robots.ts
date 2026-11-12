import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/search*",
          "/watchlist",
          "/watched",
          "/lists",
          "/api/",
        ],
      },
      {
        userAgent: [
          "AhrefsBot",
          "SemrushBot",
          "Bytespider",
          "PetalBot",
          "DotBot",
          "MJ12bot",
          "GPTBot",
          "CCBot",
          "ClaudeBot",
        ],
        disallow: "/",
      },
    ],
  };
}

