import Link from "next/link";

export const SUPPORT_EMAIL = "orc@orcdev.com";

export function Footer() {
  return (
    <footer className="fixed bottom-4 left-4 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-background p-2 text-sm">
      <span>
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
      <Link className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
        Support: {SUPPORT_EMAIL}
      </Link>
      <Link className="underline" href="/terms">
        Terms
      </Link>
      <Link className="underline" href="/privacy">
        Privacy
      </Link>
    </footer>
  );
}
