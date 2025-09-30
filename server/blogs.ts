"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { blogs, type InsertBlog } from "@/db/schema";

export async function getBlogs() {
  try {
    return await db.select().from(blogs);
  } catch (error) {
    throw new Error("Failed to get posts", { cause: error });
  }
}

export async function getPostBySlug(slug: string) {
  try {
    return await db.select().from(blogs).where(eq(blogs.slug, slug));
  } catch (error) {
    throw new Error("Failed to get post by slug", { cause: error });
  }
}

export async function createBlog(blog: InsertBlog) {
  try {
    const [newBlog] = await db.insert(blogs).values(blog).returning();
    return newBlog;
  } catch (error) {
    throw new Error("Failed to create blog", { cause: error });
  }
}
