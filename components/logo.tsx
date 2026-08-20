import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = "/youtube-to-blog-logo.png";

export function Logo({
  alt = "YouTube to Blog",
  className,
  priority = false,
  size = 36,
}: {
  alt?: string;
  className?: string;
  priority?: boolean;
  size?: number;
}) {
  return (
    <Image
      alt={alt}
      className={cn("h-auto", className)}
      height={size}
      priority={priority}
      src={LOGO_SRC}
      width={size}
    />
  );
}
