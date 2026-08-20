import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { isBillingEnabled } from "@/lib/billing/enabled";
import { isAdminEmail } from "@/lib/entitlements/admin";
import {
  MAX_UPLOAD_BYTES,
  SUPPORTED_UPLOAD_TYPES,
} from "@/lib/entitlements/policy";
import {
  BlogWorkflowError,
  getBlogErrorStatus,
  toPublicBlogError,
} from "@/server/blog-errors";
import { createUploadAllowance } from "@/server/upload-allowance";
import { getEntitlementTier } from "@/server/usage";

const checkUploadAllowance = createUploadAllowance({
  getEntitlementTier,
  isAdmin: (email) => isAdminEmail(email, process.env.ADMIN_EMAILS),
  isBillingEnabled,
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      onBeforeGenerateToken: async () => {
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (!session) {
          throw new BlogWorkflowError("AUTH_REQUIRED");
        }

        await checkUploadAllowance(session.user.id, session.user.email);

        return {
          addRandomSuffix: true,
          allowedContentTypes: [...SUPPORTED_UPLOAD_TYPES],
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      request,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BlogWorkflowError) {
      const publicError = toPublicBlogError(error);

      return NextResponse.json(
        { error: publicError.message },
        { status: getBlogErrorStatus(publicError) }
      );
    }

    const message =
      error instanceof Error ? error.message : "Upload failed. Try again.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
