"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createCustomList(name: string, description?: string | null) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!name || name.trim() === "") {
    return { success: false, error: "List name is required" };
  }

  try {
    const list = await prisma.customList.create({
      data: {
        userId,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath("/lists");
    return { success: true, list };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "A list with this name already exists" };
    }
    console.error("Failed to create list:", error);
    return { success: false, error: "Failed to create list" };
  }
}

export async function deleteCustomList(listId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.customList.delete({
      where: {
        id: listId,
        userId, // ensure ownership
      },
    });

    revalidatePath("/lists");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete list:", error);
    return { success: false, error: "Failed to delete list" };
  }
}

export async function addToList(
  listId: string,
  item: {
    mediaId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    releaseDate?: string | null;
  }
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify list ownership
    const list = await prisma.customList.findUnique({
      where: {
        id: listId,
        userId,
      },
    });

    if (!list) {
      return { success: false, error: "List not found or unauthorized" };
    }

    const listItem = await prisma.customListItem.create({
      data: {
        listId,
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        title: item.title,
        posterPath: item.posterPath,
        backdropPath: item.backdropPath,
        releaseDate: item.releaseDate,
      },
    });

    revalidatePath(`/lists/${listId}`);
    revalidatePath("/lists");
    return { success: true, listItem };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Item is already in this list" };
    }
    console.error("Failed to add item to list:", error);
    return { success: false, error: "Failed to add item to list" };
  }
}

export async function removeFromList(listId: string, mediaId: number, mediaType: "movie" | "tv") {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify list ownership
    const list = await prisma.customList.findUnique({
      where: {
        id: listId,
        userId,
      },
    });

    if (!list) {
      return { success: false, error: "List not found or unauthorized" };
    }

    await prisma.customListItem.deleteMany({
      where: {
        listId,
        mediaId,
        mediaType,
      },
    });

    revalidatePath(`/lists/${listId}`);
    revalidatePath("/lists");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove item from list:", error);
    return { success: false, error: "Failed to remove item from list" };
  }
}

export async function getUserLists() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const lists = await prisma.customList.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          take: 4, // Retrieve up to 4 posters to show a beautiful preview
          select: {
            posterPath: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return lists;
  } catch (error) {
    console.error("Failed to fetch user lists:", error);
    return [];
  }
}

export async function getListWithItems(listId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const list = await prisma.customList.findFirst({
      where: {
        id: listId,
        userId,
      },
      include: {
        items: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return list;
  } catch (error) {
    console.error("Failed to get list with items:", error);
    return null;
  }
}

export async function checkItemInLists(mediaId: number, mediaType: "movie" | "tv") {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const listItems = await prisma.customListItem.findMany({
      where: {
        mediaId,
        mediaType,
        list: {
          userId,
        },
      },
      select: {
        listId: true,
      },
    });

    return listItems.map((item) => item.listId);
  } catch (error) {
    console.error("Failed to check item in lists:", error);
    return [];
  }
}
