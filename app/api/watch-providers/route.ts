import { NextResponse } from "next/server";
import { getMediaWatchProviders } from "@/lib/tmdb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = (searchParams.get("type") as "movie" | "tv") || "movie";
    const country = searchParams.get("country") || "US";

    if (!id) {
      return NextResponse.json(null);
    }

    const data = await getMediaWatchProviders(id, type);
    const countryData = data?.results?.[country] || null;

    return NextResponse.json(countryData, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Watch providers API error:", error);
    return NextResponse.json(null, { status: 500 });
  }
}

