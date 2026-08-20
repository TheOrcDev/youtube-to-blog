const MAX_INITIALS = 2;
const INITIALS_SEPARATOR = /[\s._-]+/u;

export function getAvatarInitials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "";
  const initials = source
    .split(INITIALS_SEPARATOR)
    .filter(Boolean)
    .slice(0, MAX_INITIALS)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "?";
}
