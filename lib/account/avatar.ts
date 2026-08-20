import { z } from "zod";

export const MAX_AVATAR_SOURCE_BYTES = 8 * 1024 * 1024;
export const MAX_AVATAR_DATA_URI_BYTES = 96 * 1024;
const MAX_REMOTE_AVATAR_URL_LENGTH = 2048;

const AVATAR_DATA_URI_PATTERN =
  /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export const avatarImageSchema = z
  .string()
  .max(MAX_AVATAR_DATA_URI_BYTES)
  .regex(AVATAR_DATA_URI_PATTERN);

export const avatarUpdateSchema = z
  .object({
    image: avatarImageSchema.nullable(),
  })
  .strict();

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUserImage(image: unknown): string | null {
  if (typeof image !== "string" || image.length === 0) {
    return null;
  }

  if (image.startsWith("data:")) {
    return avatarImageSchema.safeParse(image).success ? image : null;
  }

  if (image.length <= MAX_REMOTE_AVATAR_URL_LENGTH && isHttpsUrl(image)) {
    return image;
  }

  return null;
}
