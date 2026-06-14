"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addToWatchedHistory(data: {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  runtime?: number | null;
  rating?: number | null;
  notes?: string | null;
  watchedAt?: Date | string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const item = await prisma.watchedItem.create({
      data: {
        userId,
        mediaId: data.mediaId,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
        backdropPath: data.backdropPath,
        releaseDate: data.releaseDate,
        runtime: data.runtime,
        rating: data.rating,
        notes: data.notes,
        watchedAt: data.watchedAt ? new Date(data.watchedAt) : new Date(),
      },
    });

    // Automatically remove from watchlist if it exists there
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        mediaId: data.mediaId,
        mediaType: data.mediaType,
      },
    });

    revalidatePath("/watched");
    revalidatePath("/watchlist");
    revalidatePath(`/${data.mediaType}/${data.mediaId}`);
    return { success: true, item };
  } catch (error: any) {
    console.error("Failed to add to watched history:", error);
    return { success: false, error: "Failed to add to watch history" };
  }
}

export async function removeFromWatchedHistory(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const item = await prisma.watchedItem.delete({
      where: {
        id,
        userId, // ensure ownership
      },
    });
    revalidatePath("/watched");
    revalidatePath(`/${item.mediaType}/${item.mediaId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove from watched history:", error);
    return { success: false, error: "Failed to remove from watch history" };
  }
}

export async function getUserWatchedHistory() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const items = await prisma.watchedItem.findMany({
      where: {
        userId,
      },
      orderBy: {
        watchedAt: "desc",
      },
    });
    return items;
  } catch (error) {
    console.error("Failed to get watched history:", error);
    return [];
  }
}

export async function getWatchedCount(mediaId: number, mediaType: "movie" | "tv") {
  const { userId } = await auth();

  if (!userId) {
    return { count: 0, lastWatched: null, lastRating: null };
  }

  try {
    const items = await prisma.watchedItem.findMany({
      where: {
        userId,
        mediaId,
        mediaType,
      },
      orderBy: {
        watchedAt: "desc",
      },
    });

    if (items.length === 0) {
      return { count: 0, lastWatched: null, lastRating: null };
    }

    return {
      count: items.length,
      lastWatched: items[0].watchedAt,
      lastRating: items[0].rating,
    };
  } catch (error) {
    console.error("Failed to get watched count:", error);
    return { count: 0, lastWatched: null, lastRating: null };
  }
}

export async function getWatchStats() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const items = await prisma.watchedItem.findMany({
      where: {
        userId,
      },
    });

    const totalCount = items.length;
    
    // Total Runtime
    // For movies, we use the stored runtime. For TV, we estimate 40 mins per watched item if runtime not stored.
    let totalRuntime = 0;
    items.forEach((item) => {
      if (item.runtime) {
        totalRuntime += item.runtime;
      } else {
        totalRuntime += item.mediaType === "movie" ? 100 : 40; // fallback values
      }
    });

    // Rating Breakdown (1 to 5 stars)
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratedItemsCount = 0;
    let ratingSum = 0;

    items.forEach((item) => {
      if (item.rating) {
        ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
        ratingSum += item.rating;
        ratedItemsCount++;
      }
    });

    const averageRating = ratedItemsCount > 0 ? ratingSum / ratedItemsCount : 0;

    // Monthly Watch History for the current year
    const currentYear = new Date().getFullYear();
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i).toLocaleString("default", { month: "short" }),
      count: 0,
    }));

    items.forEach((item) => {
      const watchedDate = new Date(item.watchedAt);
      if (watchedDate.getFullYear() === currentYear) {
        const monthIndex = watchedDate.getMonth();
        monthlyData[monthIndex].count++;
      }
    });

    return {
      totalCount,
      totalRuntime,
      averageRating: Number(averageRating.toFixed(1)),
      ratingCounts,
      monthlyData,
    };
  } catch (error) {
    console.error("Failed to fetch watch stats:", error);
    return {
      totalCount: 0,
      totalRuntime: 0,
      averageRating: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      monthlyData: [],
    };
  }
}
