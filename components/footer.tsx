import Link from "next/link";

export function Footer() {
  return (
    <footer className="fixed bottom-4 left-4 rounded-md bg-background p-2">
      Made with 🪓 by{" "}
      <Link
        className="underline"
        href="https://orcdev.com"
        rel="noopener noreferrer"
        target="_blank"
      >
        OrcDev
      </Link>
    </footer>
  );
}
