import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getCourse } from "@/data/courses";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Lock, ShieldCheck, Award, Copy } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { certificateUrl } from "@/lib/certificate";
import { submitOrder } from "@/actions/checkout";

const searchSchema = z.object({
  plan: z.enum(["cert", "course", "bundle"]).default("cert"),
  route: z.enum(["exam", "attest"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
});

export const Route = createFileRoute("/checkout/$slug")({
  validateSearch: searchSchema,
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Checkout — CertPath" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `Checkout — ${loaderData.course.title} | CertPath` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: CheckoutError,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      Course not found. <Link to="/courses" className="text-primary underline">Browse courses</Link>
    </div>
  ),
  component: CheckoutPage,
});

function CheckoutError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => reportLovableError(error, { boundary: "checkout_route" }), [error]);
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-xl font-semibold">Checkout error</h1>
      <button
        onClick={() => { router.invalidate(); reset(); }}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function CheckoutPage() {
  const { course } = Route.useLoaderData() as { course: import("@/data/courses").Course };
  const { plan, route, score } = Route.useSearch();

  const price =
    plan === "course" ? course.coursePrice : plan === "bundle" ? course.bundlePrice : course.certPrice;
  const planLabel =
    plan === "course"
      ? "Course access"
      : plan === "bundle"
        ? "Course + Certification"
        : `Certification (${route === "attest" ? "Attestation" : "Exam"})`;
  const whopPlanId =
    plan === "course" ? course.whopPlanCourse : plan === "bundle" ? course.whopPlanBundle : course.whopPlanCert;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [attest, setAttest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [certCode, setCertCode] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const needsAttestation = plan === "cert" && route === "attest";
  const canSubmit = email && name && (!needsAttestation || attest) && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    // NOTE: Whop in-app checkout scaffold.
    // Replace with real Whop embedded checkout: https://docs.whop.com/checkout
    // e.g. window.whop?.openCheckout({ planId: whopPlanId, email, ... })
    console.log("[Whop] Would open checkout for planId:", whopPlanId, { email, name, plan, route });
    try {
      const result = await submitOrder({ data: { courseSlug: course.slug, plan, route, name, email, examScore: score } });
      setCertCode(result.certificateCode);
      setDone(true);
    } catch (err) {
      reportLovableError(err instanceof Error ? err : new Error(String(err)), { boundary: "checkout_submit" });
      setSubmitError("Something went wrong recording your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const certLink = certCode ? certificateUrl({ slug: course.slug, name, code: certCode }) : null;

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">You're all set</h1>
          <p className="mt-2 text-muted-foreground">
            A receipt and access instructions for <strong>{planLabel}</strong> in {course.title} have
            been sent to <strong>{email}</strong>.
          </p>

          {certCode && certLink && (
            <div className="mt-6 w-full rounded-xl border border-primary/30 bg-primary/5 p-5 text-left">
              <div className="flex items-center gap-2 text-primary">
                <Award className="h-5 w-5" />
                <h2 className="font-semibold text-foreground">Your certificate is ready</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                This validation code was included with your Whop purchase — anyone can use it to
                confirm your certificate is genuine.
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2">
                <code className="text-sm font-semibold tracking-wider text-foreground">{certCode}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(certCode)}
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-12 lg:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">Secure in-app checkout powered by Whop.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-xl border border-border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label>Card details</Label>
              <div className="mt-1 rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Whop embedded checkout will render here.
                </div>
                <div className="mt-1 text-xs">Plan ID: <code>{whopPlanId}</code></div>
              </div>
            </div>

            {needsAttestation && (
              <label className="flex items-start gap-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
                <Checkbox checked={attest} onCheckedChange={(v) => setAttest(v === true)} className="mt-0.5" />
                <span className="text-muted-foreground">
                  I attest that I have working knowledge and/or professional experience in{" "}
                  <strong className="text-foreground">{course.title}</strong> and understand this
                  certification is issued based on my attestation.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing..." : `Pay ${price} · Complete purchase`}
            </button>
            {submitError && (
              <p className="text-center text-sm text-destructive">{submitError}</p>
            )}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout · 7-day refund
            </p>
          </form>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Order summary</h2>
          <div className="mt-4 border-b border-border pb-4">
            <div className="font-semibold text-card-foreground">{course.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">{planLabel}</div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">${price}.00</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="text-foreground">$0.00</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-semibold">${price}.00</span>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            One-time payment. Instant access after checkout.
          </div>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
