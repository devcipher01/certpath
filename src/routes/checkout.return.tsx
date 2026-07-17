import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CertPreview } from "@/components/cert-preview";
import { CheckCircle2, Copy, AlertCircle, RefreshCw, Download, ExternalLink } from "lucide-react";
import { certificateUrl } from "@/lib/certificate";
import { saveCertLocally } from "@/lib/cert-storage";
import { finalizeCheckout } from "@/actions/checkout";

const searchSchema = z.object({
  token: z.string().min(1),
});

export const Route = createFileRoute("/checkout/return")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ token: search.token }),
  loader: async ({ deps }) => {
    return finalizeCheckout({ data: { token: deps.token } });
  },
  head: () => ({
    meta: [
      { title: "Order confirmed — CertPath" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ReturnError,
  component: ReturnPage,
  pendingComponent: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Confirming your payment…</p>
      </main>
      <SiteFooter />
    </div>
  ),
});

function ReturnError({ error }: { error: Error }) {
  const isPendingError =
    error.message.includes("not yet confirmed") || error.message.includes("not found");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">
          {isPendingError ? "Payment not confirmed yet" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPendingError
            ? "Whop is still processing your payment. Give it a moment then refresh."
            : error.message}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {isPendingError && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          )}
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Back to courses
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ReturnPage() {
  const result = Route.useLoaderData();
  const { orderId, certificateCode, plan, name, email, courseName, courseSlug } = result;
  const [copied, setCopied] = useState<"url" | "code" | null>(null);

  const planLabel =
    plan === "course"
      ? "Course access"
      : plan === "bundle"
        ? "Course + Certification"
        : "Certification";

  const certRelativeLink =
    certificateCode ? certificateUrl({ slug: courseSlug, name, code: certificateCode }) : null;

  const certAbsoluteUrl =
    typeof window !== "undefined" && certRelativeLink
      ? `${window.location.origin}${certRelativeLink}`
      : certRelativeLink ?? "";

  const issuedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Persist to localStorage so the user can recover the cert without keeping the email
  useEffect(() => {
    if (!certificateCode || !certAbsoluteUrl) return;
    saveCertLocally({
      certUrl: certAbsoluteUrl,
      code: certificateCode,
      courseName,
      recipientName: name,
      courseSlug,
      savedAt: new Date().toISOString(),
    });
  }, [certificateCode, certAbsoluteUrl, courseName, name, courseSlug]);

  function copyToClipboard(text: string, which: "url" | "code") {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        {/* Confirmation header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">You're all set!</h1>
          <p className="mt-2 text-muted-foreground">
            A receipt for <strong>{planLabel}</strong> in <strong>{courseName}</strong> has been
            sent to <strong>{email}</strong>.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Order #{orderId}</p>
        </div>

        {certificateCode && certRelativeLink ? (
          <>
            {/* Certificate preview */}
            <CertPreview
              courseTitle={courseName}
              recipientName={name}
              date={issuedDate}
              hideNote
            />

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-4 w-4" /> Save as PDF
              </button>
              <a
                href={certRelativeLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" /> View certificate page
              </a>
            </div>

            {/* Shareable cert URL */}
            <div className="mt-6 rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your certificate link
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Anyone with this link can verify your certificate. Bookmark it or share it on
                LinkedIn, your resume, or with an employer.
              </p>
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2">
                <code className="min-w-0 flex-1 truncate text-xs text-foreground">
                  {certAbsoluteUrl}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(certAbsoluteUrl, "url")}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === "url" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Validation code */}
            <div className="mt-3 rounded-xl border border-border bg-card p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Validation code
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Paste this code when someone asks you to prove the certificate is genuine.
              </p>
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2">
                <code className="flex-1 text-sm font-semibold tracking-wider text-foreground">
                  {certificateCode}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(certificateCode, "code")}
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied === "code" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* localStorage recovery note */}
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Your certificate link has been saved in this browser — if you lose the link, visit
              the certificate page again from any saved bookmark or the email receipt.
            </p>
          </>
        ) : (
          // Non-cert plans (course-only) — no cert issued
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Check your email for course access instructions.
          </p>
        )}

        <div className="mt-8 text-center">
          <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
            Back to courses →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
