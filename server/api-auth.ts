import { eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import { createApiAllowance } from "./api-allowance";
import { toPublicBlogError } from "./blog-errors";
import { getEntitlementTier } from "./usage";

const BEARER_PREFIX = "bearer ";

export interface ApiUser {
  email: string;
  id: string;
  name: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export type ApiAuthResult =
  | { ok: true; user: ApiUser }
  | { body: ApiErrorBody; ok: false; status: number };

const checkApiAllowance = createApiAllowance({
  getEntitlementTier,
  isAdmin: (email) => isAdminEmail(email, process.env.ADMIN_EMAILS),
  isBillingEnabled,
});

function apiError(
  status: number,
  code: string,
  message: string
): ApiAuthResult {
  return { body: { error: { code, message } }, ok: false, status };
}

export function extractApiKey(request: Request): string | null {
  const headerKey = request.headers.get("x-api-key");

  if (headerKey) {
    return headerKey.trim();
  }

  const authorization = request.headers.get("authorization");

  if (authorization?.toLowerCase().startsWith(BEARER_PREFIX)) {
    return authorization.slice(BEARER_PREFIX.length).trim();
  }

  return null;
}

export async function authenticateApiRequest(
  request: Request
): Promise<ApiAuthResult> {
  const key = extractApiKey(request);

  if (!key) {
    return apiError(
      401,
      "MISSING_API_KEY",
      "Provide an API key via the Authorization: Bearer header or the x-api-key header."
    );
  }

  const verification = await auth.api.verifyApiKey({ body: { key } });

  if (!verification.valid) {
    if (verification.error?.code.includes("RATE_LIMIT")) {
      return apiError(
        429,
        "RATE_LIMITED",
        "Too many requests. Try again in a minute."
      );
    }

    return apiError(
      401,
      "INVALID_API_KEY",
      "This API key is invalid, disabled, or expired."
    );
  }

  const userId = verification.key?.referenceId;

  if (!userId) {
    return apiError(
      401,
      "INVALID_API_KEY",
      "This API key is invalid, disabled, or expired."
    );
  }

  const account = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  if (!account) {
    return apiError(
      401,
      "INVALID_API_KEY",
      "This API key is invalid, disabled, or expired."
    );
  }

  try {
    await checkApiAllowance(account.id, account.email);
  } catch (error) {
    const publicError = toPublicBlogError(error);

    return apiError(402, publicError.code, publicError.message);
  }

  return {
    ok: true,
    user: { email: account.email, id: account.id, name: account.name },
  };
}
