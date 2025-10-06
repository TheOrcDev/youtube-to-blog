import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "404 | OrcDev",
};

export default function NotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Image
            alt="Pixel Orc - 404"
            height={300}
            src={"/images/404/pixel-orc.png"}
            width={300}
          />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle className="font-bold text-2xl tracking-tight sm:text-4xl">
        You are lost.
      </EmptyTitle>
      <EmptyDescription>Return to the home page.</EmptyDescription>
      <EmptyContent>
        <Button variant="outline">
          <Link href="/">Return to the home page</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
