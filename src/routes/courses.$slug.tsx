import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getCourse, COURSES } from "@/data/courses";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonQuiz } from "@/components/lesson-quiz";
import { Award, BookOpen, Clock, ArrowRight, ShieldCheck, Clipboard, PlayCircle } from "lucide-react";
import { CertPreview } from "@/components/cert-preview";
import { reportLovableError } from "@/lib/lovable-error-reporting";

// ── Simple inline markdown renderer ──────────────────────────────────────────
// Handles **bold**, and lines starting with "• " as list items.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function renderContent(paragraph: string) {
  // Split on newlines so bullet lists embedded in a paragraph render as <ul>
  const lines = paragraph.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];

  function flushList() {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="ml-1 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground">
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
    } else if (trimmed === "") {
      flushList();
    } else {
      flushList();
      nodes.push(
        <p key={`p-${nodes.length}`} className="text-sm leading-relaxed text-foreground">
          {renderInline(trimmed)}
        </p>
      );
    }
  }
  flushList();
  return nodes;
}

export const Route = createFileRoute("/courses/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Course not found — CertPath" }, { name: "robots", content: "noindex" }] };
    }
    const c = loaderData.course;
    return {
      meta: [
        { title: `${c.title} — Course & Certification | CertPath` },
        { name: "description", content: c.tagline },
        { property: "og:title", content: `${c.title} — CertPath` },
        { property: "og:description", content: c.description },
      ],
    };
  },
  errorComponent: CourseError,
  notFoundComponent: CourseNotFound,
  component: CoursePage,
});

function CourseNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Course not found</h1>
        <p className="mt-2 text-muted-foreground">We couldn't find that course.</p>
        <Link to="/courses" className="mt-4 text-primary hover:underline">Back to all courses</Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function CourseError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => reportLovableError(error, { boundary: "course_route" }), [error]);
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

function CoursePage() {
  const { course } = Route.useLoaderData() as { course: import("@/data/courses").Course };
  const related = COURSES.filter((c) => c.category === course.category && c.slug !== course.slug).slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <Link to="/courses" className="text-sm text-muted-foreground hover:text-foreground">← All courses</Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">{course.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {course.duration}</span>
              <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {course.lessons} lessons</span>
              <span className="inline-flex items-center gap-1"><Award className="h-4 w-4" /> {course.examQuestions}-question cert exam</span>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Award className="h-3.5 w-3.5" /> Your certificate preview
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
                Here's what you'll earn
              </h2>
              <p className="mt-2 text-muted-foreground">
                Every learner receives an official <span className="font-medium text-foreground">CertPath</span> PDF
                certificate on completion — verifiable, downloadable, and shareable on LinkedIn. Preview the
                exact layout below, then choose how you want to move forward.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/certifications/$slug"
                  params={{ slug: course.slug }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Award className="h-4 w-4" /> Get certified
                </Link>
                <a
                  href="#course-content"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <PlayCircle className="h-4 w-4" /> Continue to course
                </a>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Bundle (course + certification) — ${course.bundlePrice}. Cert-only from ${course.certPrice}.
              </p>
            </div>
            <CertPreview courseTitle={course.title} />
          </div>
        </section>

        <section id="course-content" className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-3">

          <div className="lg:col-span-2">
            <Tabs defaultValue="tutorials">
              <TabsList>
                <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cert">Certification</TabsTrigger>
              </TabsList>
              <TabsContent value="tutorials" className="mt-6">
                <p className="mb-3 text-sm text-muted-foreground">
                  {course.tutorials.length} modules · each with lesson content and a short knowledge check.
                </p>
                <Accordion type="multiple" className="rounded-lg border border-border bg-card">
                  {course.tutorials.map((tut, i) => (
                    <AccordionItem key={i} value={`m-${i}`} className="px-4 last:border-b-0">
                      <AccordionTrigger className="py-4">
                        <div className="flex flex-1 items-start justify-between gap-4 pr-2 text-left">
                          <div>
                            <h3 className="font-medium text-card-foreground">{tut.title}</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">{tut.summary}</p>
                          </div>
                          <span className="whitespace-nowrap text-xs text-muted-foreground">
                            {tut.minutes} min
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-3">
                          {tut.content.flatMap((p, pi) =>
                            renderContent(p).map((node, ni) =>
                              <div key={`${pi}-${ni}`}>{node}</div>
                            )
                          )}
                        </div>
                        <div className="rounded-md border border-border bg-background/60 p-3">
                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <Clipboard className="h-4 w-4 text-primary" /> Key points
                          </div>
                          <ul className="ml-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                            {tut.keyPoints.map((k, ki) => (
                              <li key={ki}>{k}</li>
                            ))}
                          </ul>
                        </div>
                        <LessonQuiz questions={tut.quiz} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="overview" className="mt-6">
                <p className="leading-relaxed text-foreground">{course.description}</p>
                <h3 className="mt-6 font-semibold">What you'll learn</h3>
                <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  {course.tutorials.map((t, i) => (
                    <li key={i}>• {t.title.replace(/^Module \d+: /, "")}</li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="cert" className="mt-6 space-y-4">
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Two ways to certify</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You can complete the course first, or get certified right now — either via a short
                    proficiency exam or a purchase-and-attest option if you already work in the field.
                  </p>
                </div>
                <Link
                  to="/certifications/$slug"
                  params={{ slug: course.slug }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  See certification-only options <ArrowRight className="h-4 w-4" />
                </Link>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-3">
            <PurchaseCard
              title="Certification only"
              price={course.certPrice}
              slug={course.slug}
              plan="cert"
              blurb="Get the credential now via exam or attestation."
            />
            <PurchaseCard
              title="Course only"
              price={course.coursePrice}
              slug={course.slug}
              plan="course"
              blurb="Full tutorials and materials."
            />
            <PurchaseCard
              title="Course + Certification"
              price={course.bundlePrice}
              slug={course.slug}
              plan="bundle"
              blurb="Best value — everything included."
              highlight
            />
          </aside>
        </section>

        {related.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <h2 className="mb-4 text-xl font-semibold">Related in {course.category}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to="/courses/$slug"
                  params={{ slug: r.slug }}
                  className="rounded-lg border border-border bg-card p-4 hover:shadow-md"
                >
                  <div className="text-sm font-medium text-card-foreground">{r.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.tagline}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function PurchaseCard({
  title,
  price,
  slug,
  plan,
  blurb,
  highlight,
}: {
  title: string;
  price: number;
  slug: string;
  plan: "cert" | "course" | "bundle";
  blurb: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        <div className="text-2xl font-semibold text-foreground">${price}</div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      <Link
        to="/checkout/$slug"
        params={{ slug }}
        search={{ plan }}
        className={`mt-4 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
          highlight
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-input bg-background text-foreground hover:bg-accent"
        }`}
      >
        Continue <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
