import Image from "next/image";
import Link from "next/link";
import { CommandMenu } from "./command-menu";
import { ModeSwitcher } from "./mode-switcher";
import { Button } from "./ui/button";
import { UserButton } from "./user-button";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-4 flex min-w-0 items-center justify-between gap-1 px-2 sm:gap-2 sm:px-4">
      <Link className="shrink-0" href="/">
        <Image
          alt="Youtube to Blog"
          className="size-10 sm:size-[50px]"
          height={50}
          src="/youtube-to-blog-logo.png"
          width={50}
        />
      </Link>

      <div className="flex min-w-0 items-center gap-1 sm:gap-2">
        <div className="hidden sm:block">
          <Button asChild size="sm" variant="ghost">
            <Link aria-label="Why multiple blogs?" href="/why">
              Why Multiple Blogs?
            </Link>
          </Button>
        </div>
        <CommandMenu />
        <Button
          aria-label="View source on GitHub"
          asChild
          size="icon-sm"
          variant="ghost"
        >
          <Link
            aria-label="View source on GitHub"
            href="https://github.com/TheOrcDev/youtube-to-blog"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg
              aria-hidden="true"
              className="size-4 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </Link>
        </Button>
        <ModeSwitcher />
        <UserButton />
      </div>
    </header>
  );
}
