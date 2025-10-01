import Image from "next/image";
import Link from "next/link";
import { ModeSwitcher } from "./mode-switcher";

export function Header() {
  return (
    <header className="absolute top-4 flex w-full items-center justify-between gap-2 px-4">
      <Link href="/">
        <Image
          alt="Youtube to Blog"
          height={50}
          src="/youtube-to-blog-logo.png"
          width={50}
        />
      </Link>

      <ModeSwitcher />
    </header>
  );
}
