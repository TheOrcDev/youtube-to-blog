"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  DEFAULT_WRITING_STYLE_ID,
  isWritingStyleId,
  MAX_STYLE_INSTRUCTIONS_LENGTH,
  type WritingStyleId,
} from "@/lib/writing-styles";
import {
  getSavedWritingStyleForUser,
  upsertWritingStyleForUser,
} from "./preferences";
import { canUseCustomStyles } from "./usage";
import type { ProfileActionResult } from "./users";

export interface WritingPreferences {
  canUseCustomInstructions: boolean;
  styleInstructions: string;
  writingStyle: WritingStyleId;
}

export async function getWritingPreferences(): Promise<WritingPreferences | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  const [saved, allowed] = await Promise.all([
    getSavedWritingStyleForUser(session.user.id),
    canUseCustomStyles(),
  ]);

  return {
    canUseCustomInstructions: allowed,
    styleInstructions: saved?.styleInstructions ?? "",
    writingStyle:
      saved && isWritingStyleId(saved.writingStyle)
        ? saved.writingStyle
        : DEFAULT_WRITING_STYLE_ID,
  };
}

export async function saveWritingPreferences({
  styleInstructions,
  writingStyle,
}: {
  styleInstructions: string;
  writingStyle: string;
}): Promise<ProfileActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { message: "Please sign in to save your writing style.", ok: false };
  }

  if (!isWritingStyleId(writingStyle)) {
    return { message: "Pick one of the available writing styles.", ok: false };
  }

  const instructions = styleInstructions.trim();

  if (instructions.length > MAX_STYLE_INSTRUCTIONS_LENGTH) {
    return {
      message: `Style instructions must be at most ${MAX_STYLE_INSTRUCTIONS_LENGTH} characters.`,
      ok: false,
    };
  }

  if (instructions && !(await canUseCustomStyles())) {
    return {
      message:
        "Custom style instructions are a Pro feature. Upgrade to write in your own voice.",
      ok: false,
    };
  }

  try {
    await upsertWritingStyleForUser(session.user.id, {
      styleInstructions: instructions || null,
      writingStyle,
    });
  } catch {
    return {
      message: "Could not save your writing style. Please try again.",
      ok: false,
    };
  }

  return { ok: true };
}
