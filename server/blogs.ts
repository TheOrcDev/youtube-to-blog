"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { blogs, type InsertBlog } from "@/db/schema";
import { cleanYouTubeUrl, extractVideoId } from "@/lib/youtube";
import { getCurrentUser } from "./users";

export async function getBlogs() {
  try {
    return await db.select().from(blogs);
  } catch (error) {
    throw new Error("Failed to get posts", { cause: error });
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const [post] = await db.select().from(blogs).where(eq(blogs.slug, slug));
    return post;
  } catch (error) {
    throw new Error("Failed to get post by slug", { cause: error });
  }
}

export async function createBlog(blog: InsertBlog) {
  try {
    const currentUser = await getCurrentUser();
    const [newBlog] = await db
      .insert(blogs)
      .values({ ...blog, userId: currentUser.user.id })
      .returning();
    return newBlog;
  } catch (error) {
    throw new Error("Failed to create blog", { cause: error });
  }
}

export async function checkBlogExists(youtubeUrl: string) {
  try {
    // Clean the URL and extract video ID as slug
    const cleanedUrl = cleanYouTubeUrl(youtubeUrl);
    const slug = extractVideoId(cleanedUrl);

    if (!slug) {
      throw new Error("Invalid YouTube URL");
    }

    const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug));
    return blog;
  } catch (error) {
    throw new Error("Failed to check blog exists", { cause: error });
  }
}
