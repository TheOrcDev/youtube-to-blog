import Link from "next/link";

import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Image
              width={50}
              height={50}
              src={"/better-auth-starter.png"}
              alt="Better Auth Starter Logo"
              priority
            />
          </div>
          Better Auth Starter
        </Link>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
