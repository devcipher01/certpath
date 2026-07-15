import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CheckCircle2, Award, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { certificateUrl } from "@/lib/certificate";
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

  const planLabel =
    plan === "course"
      ? "Course access"
      : plan === "bundle"
        ? "Course + Certification"
        : "Certification";

  const certLink =
    certificateCode ? certificateUrl({ slug: courseSlug, name, code: certificateCode }) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">You're all set!</h1>
        <p className="mt-2 text-muted-foreground">
          A receipt and access instructions for <strong>{planLabel}</strong> in{" "}
          <strong>{courseName}</strong> have been sent to <strong>{email}</strong>.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Order #{orderId}</p>

        {certificateCode && certLink && (
          <div className="mt-6 w-full rounded-xl border border-primary/30 bg-primary/5 p-5 text-left">
            <div className="flex items-center gap-2 text-primary">
              <Award className="h-5 w-5" />
              <h2 className="font-semibold text-foreground">Your certificate is ready</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this validation code to prove your certificate is genuine — share it with
              employers or paste it on LinkedIn.
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2">
              <code className="text-sm font-semibold tracking-wider text-foreground">
                {certificateCode}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(certificateCode)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
            <a
              href={certLink}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              View your certificate online <Award className="h-4 w-4" />
            </a>
          </div>
        )}

        <Link to="/courses" className="mt-6 text-sm font-medium text-primary hover:underline">
          Back to courses →
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
