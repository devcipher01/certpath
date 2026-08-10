// Client-safe certificate helpers. The actual validation codes are minted
// and verified server-side (see src/server/functions/checkout.ts and
// src/server/functions/certificates.ts) against the database — this file
// only builds the pretty, shareable URL once a code is known.

/** Turns a person's name into a URL-safe slug, e.g. "Ada Lovelace" -> "ada-lovelace". */
export function slugifyName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "learner";
}

/** Builds the shareable "view your certificate online" URL for an already-issued code. */
export function certificateUrl({ slug, name, code }: { slug: string; name: string; code: string }): string {
  const params = new URLSearchParams({ code });
  return `/certificate/${slug}/${slugifyName(name)}?${params.toString()}`;
}
