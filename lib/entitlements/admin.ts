// Admins are configured by email so access survives account recreation and does
// not depend on any subscription state.
export function parseAdminEmails(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(
  email: string | null | undefined,
  raw: string | null | undefined
): boolean {
  if (!email) {
    return false;
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return parseAdminEmails(raw).includes(normalized);
}
