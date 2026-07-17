import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { lookupCertsByContact } from "@/actions/certificates";
import { certificateUrl } from "@/lib/certificate";
import { Search, Award, ExternalLink, FileQuestion, Loader2 } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/pricing")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    const q = deps.q?.trim() ?? "";
    if (!q) return { certs: null, q: "" };
    try {
      const certs = await lookupCertsByContact({ data: { query: q } });
      return { certs, q };
    } catch {
      return { certs: [] as Awaited<ReturnType<typeof lookupCertsByContact>>, q };
    }
  },
  head: () => ({
    meta: [
      { title: "Find Your Certificate — CertPath" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FindCertPage,
});

function FindCertPage() {
  const { certs, q } = Route.useLoaderData();
  const navigate = useNavigate();
  const [input, setInput] = useState(q || "");
  const [navigating, setNavigating] = useState(false);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setNavigating(true);
    navigate({ to: "/pricing", search: { q: input.trim() } }).finally(() =>
      setNavigating(false),
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Award className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Find your certificate</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Lost your cert link? Enter the name or email address you used at checkout and
            we'll pull up your certificate.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your name or email address…"
              className="w-full rounded-md border border-input bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={navigating || !input.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {navigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </form>

        {/* Results */}
        {certs === null ? (
          /* No search yet */
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Enter your name (or email) above to look up any certificate we've issued to you.</p>
            <p className="mt-2 text-xs">
              Tip: use your email for an exact match, or your name for a broader search.
            </p>
          </div>
        ) : certs.length === 0 ? (
          /* No matches */
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <FileQuestion className="h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No certificates found</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Double-check the spelling or try the email address you used at checkout. If you
              think there's an error, check your purchase receipt for the certificate link.
            </p>
          </div>
        ) : (
          /* Matches */
          <div className="mt-8 space-y-3">
            <p className="text-sm text-muted-foreground">
              {certs.length === 1
                ? "Found 1 certificate."
                : `Found ${certs.length} certificates.`}
            </p>
            {certs.map((cert) => {
              const link = certificateUrl({
                slug: cert.courseSlug,
                name: cert.recipientName,
                code: cert.code,
              });
              const issued = new Date(cert.issuedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });
              return (
                <div
                  key={cert.code}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-primary">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-semibold text-foreground">{cert.courseTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Issued to <strong>{cert.recipientName}</strong> · {issued}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Code: {cert.code}
                    </p>
                  </div>
                  <a
                    href={link}
                    className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <ExternalLink className="h-4 w-4" /> View &amp; Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
