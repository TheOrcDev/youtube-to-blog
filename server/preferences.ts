import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { userPreferences } from "@/db/schema";
import type { SavedWritingStyle } from "./writing-style";

// Missing rows and lookup failures both resolve to null: the writing style is
// an enhancement, and a preferences hiccup must never block generation.
export async function getSavedWritingStyleForUser(
  userId: string
): Promise<SavedWritingStyle | null> {
  try {
    const row = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!row) {
      return null;
    }

    return {
      styleInstructions: row.styleInstructions,
      writingStyle: row.writingStyle,
    };
  } catch {
    return null;
  }
}

export async function upsertWritingStyleForUser(
  userId: string,
  { styleInstructions, writingStyle }: SavedWritingStyle
): Promise<void> {
  await db
    .insert(userPreferences)
    .values({
      styleInstructions,
      updatedAt: new Date(),
      userId,
      writingStyle,
    })
    .onConflictDoUpdate({
      set: {
        styleInstructions,
        updatedAt: new Date(),
        writingStyle,
      },
      target: userPreferences.userId,
    });
}
