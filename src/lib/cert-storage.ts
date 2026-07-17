// Client-side localStorage helpers for persisting earned certificates.
// Since CertPath has no auth, this is the only local fallback so users can
// recover their cert URL without keeping the email receipt.

export interface SavedCert {
  certUrl: string;       // full absolute URL, e.g. https://certpath.live/certificate/...
  code: string;          // validation code, e.g. "AB12-CD34"
  courseName: string;
  recipientName: string;
  courseSlug: string;
  savedAt: string;       // ISO date string
}

const STORAGE_KEY = "certpath_certs";

function readAll(): SavedCert[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedCert[];
  } catch {
    return [];
  }
}

/** Persist a cert to localStorage. Deduplicates by validation code. */
export function saveCertLocally(cert: SavedCert): void {
  if (typeof window === "undefined") return;
  const existing = readAll().filter((c) => c.code !== cert.code);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([cert, ...existing]));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

/** Return all certs saved in localStorage, newest first. */
export function getSavedCerts(): SavedCert[] {
  return readAll();
}
