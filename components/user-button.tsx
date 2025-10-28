"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";

export function UserButton() {
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <>
      {session ? (
        <>
          <Link href="/blogs">
            <Button size="sm" variant="ghost">
              My Blogs
            </Button>
          </Link>
          <Button onClick={handleLogout} size="sm" variant="ghost">
            <LogOutIcon className="size-4" />
          </Button>
        </>
      ) : (
        <Link href="/login">
          <Button size="sm" variant="ghost">
            Login
          </Button>
        </Link>
      )}
    </>
  );
}
