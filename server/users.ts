"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { account, user } from "@/db/schema";
import { auth } from "@/lib/auth";

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;

const usernameSchema = z
  .string()
  .trim()
  .min(MIN_USERNAME_LENGTH)
  .max(MAX_USERNAME_LENGTH);

const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH);

export interface AccountSettings {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  hasPassword: boolean;
  image: string | null;
  name: string;
}

export type ProfileActionResult = { ok: true } | { message: string; ok: false };

export const getCurrentUser = async () => {
  // Call headers() at the top level to maintain proper async context
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    redirect("/login");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (!currentUser) {
    redirect("/login");
  }

  return {
    ...session,
    currentUser,
  };
};

function formatJoinedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const getAccountSettings = async (): Promise<AccountSettings> => {
  const { currentUser } = await getCurrentUser();
  const accounts = await db
    .select({ providerId: account.providerId })
    .from(account)
    .where(eq(account.userId, currentUser.id));

  return {
    createdAt: formatJoinedDate(currentUser.createdAt),
    email: currentUser.email,
    emailVerified: currentUser.emailVerified,
    hasPassword: accounts.some((row) => row.providerId === "credential"),
    image: currentUser.image,
    name: currentUser.name,
  };
};

export const updateUsername = async (
  username: string
): Promise<ProfileActionResult> => {
  const parsed = usernameSchema.safeParse(username);

  if (!parsed.success) {
    return {
      message: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters.`,
      ok: false,
    };
  }

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return {
      message: "Please sign in to update your username.",
      ok: false,
    };
  }

  try {
    await auth.api.updateUser({
      body: {
        name: parsed.data,
      },
      headers: headersList,
    });
  } catch {
    return {
      message: "Could not update your username. Please try again.",
      ok: false,
    };
  }

  revalidatePath("/dashboard", "layout");
  return { ok: true };
};

export const changeAccountPassword = async ({
  currentPassword,
  newPassword,
}: {
  currentPassword: string;
  newPassword: string;
}): Promise<ProfileActionResult> => {
  if (
    !(
      passwordSchema.safeParse(currentPassword).success &&
      passwordSchema.safeParse(newPassword).success
    )
  ) {
    return {
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      ok: false,
    };
  }

  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return {
      message: "Please sign in to update your password.",
      ok: false,
    };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: headersList,
    });
  } catch {
    return {
      message:
        "Could not update your password. Check your current password and try again.",
      ok: false,
    };
  }

  return { ok: true };
};

export const signIn = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};

export const signUp = async (
  email: string,
  password: string,
  username: string
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: username,
      },
    });

    return {
      success: true,
      message: "Signed up successfully.",
    };
  } catch (error) {
    const e = error as Error;

    return {
      success: false,
      message: e.message || "An unknown error occurred.",
    };
  }
};
