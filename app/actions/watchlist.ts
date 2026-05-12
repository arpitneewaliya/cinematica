"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addToWatchlist(data: {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const item = await prisma.watchlistItem.create({
      data: {
        userId,
        ...data,
      },
    });
    revalidatePath("/watchlist");
    return { success: true, item };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Item already in watchlist" };
    }
    return { success: false, error: "Failed to add to watchlist" };
  }
}

export async function removeFromWatchlist(mediaId: number, mediaType: "movie" | "tv") {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        mediaId,
        mediaType,
      },
    });
    revalidatePath("/watchlist");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to remove from watchlist" };
  }
}

export async function isInWatchlist(mediaId: number, mediaType: "movie" | "tv") {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const item = await prisma.watchlistItem.findFirst({
    where: {
      userId,
      mediaId,
      mediaType,
    },
  });

  return !!item;
}

export async function getUserWatchlist() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const items = await prisma.watchlistItem.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items;
}
