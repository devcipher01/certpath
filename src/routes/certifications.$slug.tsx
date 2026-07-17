import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getCourse } from "@/data/courses";
import { Award, CheckCircle2, FileCheck, ArrowRight } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export const Route = createFileRoute("/certifications/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Certification not found — CertPath" }, { name: "robots", content: "noindex" }] };
    const c = loaderData.course;
    return {
      meta: [
        { title: `${c.title} Certification — CertPath` },
        { name: "description", content: `Earn the ${c.title} certification for $${c.certPrice} — exam or attestation route.` },
        { property: "og:title", content: `${c.title} Certification — CertPath` },
        { property: "og:description", content: c.tagline },
      ],
    };
  },
  errorComponent: CertError,
  notFoundComponent: CertNotFound,
  component: CertPage,
});

function CertNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Certification not found</h1>
        <Link to="/certifications" className="mt-4 text-primary hover:underline">See all certifications</Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function CertError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => reportLovableError(error, { boundary: "cert_route" }), [error]);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </main>
      <SiteFooter />
    </div>
  );
}

function CertPage() {
  const { course } = Route.useLoaderData() as { course: import("@/data/courses").Course };
  const [route, setRoute] = useState<"exam" | "attest">("exam");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12">
        <Link to="/courses/$slug" params={{ slug: course.slug }} className="text-sm text-muted-foreground hover:text-foreground">← Back to course</Link>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{course.title} Certification</h1>
            <p className="text-sm text-muted-foreground">Choose how you want to earn it — ${course.certPrice}</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <FileCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <strong className="font-semibold">Already confident in your {course.title} skills?</strong> You
              can skip the course and prove your expertise directly. Pass a short proficiency exam to
              demonstrate your knowledge, then complete secure checkout to receive your certificate.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <button
            onClick={() => setRoute("exam")}
            className={`rounded-xl border p-5 text-left transition ${
              route === "exam" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Proficiency exam</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {course.examQuestions} questions. Pass with 50% and download your certificate.
            </p>
          </button>
          <button
            onClick={() => setRoute("attest")}
            className={`rounded-xl border p-5 text-left transition ${
              route === "attest" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Purchase & attest</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign a short attestation of experience, pay, and receive your certificate instantly.
            </p>
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                {route === "exam" ? "Exam route" : "Attestation route"} — {course.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {route === "exam"
                  ? "No upfront cost — answer a few questions first. You're only charged after you pass."
                  : "You'll sign an attestation and get your cert after checkout."}
              </p>
            </div>
            <div className="shrink-0 text-2xl font-semibold">${course.certPrice}</div>
          </div>
          {route === "exam" ? (
            <Link
              to="/exam/$slug"
              params={{ slug: course.slug }}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start proficiency exam <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/checkout/$slug"
              params={{ slug: course.slug }}
              search={{ plan: "cert", route }}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue to checkout <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {route === "exam" && (
            <p className="mt-3 text-xs text-muted-foreground">
              {course.examQuestions} questions · 50% to pass · retake anytime · payment only after passing.
            </p>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          Prefer to learn first?{" "}
          <Link to="/courses/$slug" params={{ slug: course.slug }} className="font-medium text-primary hover:underline">
            Take the full {course.title} course
          </Link>
          {" "}and get the skills before the credential.
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
