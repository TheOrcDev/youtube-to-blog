"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function UserButton() {
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  if (isPending) {
    return <Skeleton className="h-8 w-14 sm:w-26" />;
  }

  return (
    <>
      {session ? (
        <>
          <Button asChild size="sm" variant="ghost">
            <Link href="/blogs">My Blogs</Link>
          </Button>
          <Button
            aria-label="Log out"
            onClick={handleLogout}
            size="icon-sm"
            title="Log out"
            type="button"
            variant="ghost"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </>
      ) : (
        <Button asChild size="sm" variant="ghost">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </>
  );
}
