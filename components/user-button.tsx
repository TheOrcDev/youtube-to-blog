"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
export function UserButton() {
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
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
            Logout
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
