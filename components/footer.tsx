import Link from "next/link";

export function Footer() {
  return (
    <footer className="fixed inset-x-0 bottom-4 flex items-center justify-between gap-2 px-4 text-sm">
      <span className="rounded-md bg-background p-2">
        Made with 🪓 by{" "}
        <Link
          className="underline"
          href="https://orcdev.com"
          rel="noopener noreferrer"
          target="_blank"
        >
          OrcDev
        </Link>
      </span>

      <span className="flex items-center gap-3 rounded-md bg-background p-2">
        <Link className="underline" href="/terms">
          Terms
        </Link>
        <Link className="underline" href="/privacy">
          Privacy
        </Link>
      </span>
    </footer>
  );
}
