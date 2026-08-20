/**
 * The plan marker that sits on the account avatar.
 *
 * Colours come from the theme's primary pair rather than from literals. It is
 * `aria-hidden` on purpose: the trigger that wraps it says "Pro plan" in its
 * own label, so announcing the pill too would read the word twice.
 */
export function ProBadge() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -right-1.5 -bottom-1 inline-flex select-none items-center rounded-full bg-primary px-1.5 py-0.5 font-bold text-[0.5625rem] text-primary-foreground uppercase leading-none tracking-[0.08em] shadow-sm ring-2 ring-background"
    >
      Pro
    </span>
  );
}
