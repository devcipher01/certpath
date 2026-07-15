import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getCourse, type QuizQuestion } from "@/data/courses";
import { Check, X, RotateCcw, ArrowRight, ShieldCheck } from "lucide-react";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { recordExamAttempt } from "@/actions/exam-attempts";

const PASS_THRESHOLD = 0.5;

export const Route = createFileRoute("/exam/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Exam not found — CertPath" }, { name: "robots", content: "noindex" }] };
    const c = loaderData.course;
    return {
      meta: [
        { title: `${c.title} Certification Exam — CertPath` },
        { name: "description", content: `Pass the ${c.title} proficiency exam to earn your certification.` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: ExamError,
  notFoundComponent: ExamNotFound,
  component: ExamPage,
});

function ExamNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Exam not found</h1>
        <Link to="/certifications" className="mt-4 text-primary hover:underline">
          See all certifications
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function ExamError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => reportLovableError(error, { boundary: "exam_route" }), [error]);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </main>
      <SiteFooter />
    </div>
  );
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ExamPage() {
  const { course } = Route.useLoaderData() as { course: import("@/data/courses").Course };

  const [attempt, setAttempt] = useState(0);

  const pool = useMemo(() => course.tutorials.flatMap((t) => t.quiz), [course]);
  const target = Math.min(course.examQuestions ?? 10, pool.length);

  // Deterministic on first render so SSR and client hydration match exactly —
  // shuffling with Date.now() here would make server/client output differ and
  // break hydration. We shuffle for real client-side, after mount, below.
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => pool.slice(0, target));

  useEffect(() => {
    setQuestions(shuffle(pool, Date.now() + attempt).slice(0, target));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, target, attempt]);

  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  // Reset answers when a new attempt/question set is generated
  useEffect(() => {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  }, [questions]);

  const score = answers.reduce<number>((acc, a, i) => acc + (a === questions[i]?.answer ? 1 : 0), 0);
  const total = questions.length;
  const pct = total > 0 ? score / total : 0;
  const passed = submitted && pct >= PASS_THRESHOLD;
  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link to="/certifications/$slug" params={{ slug: course.slug }} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              {course.title} — Proficiency Exam
            </h1>
            <p className="text-sm text-muted-foreground">
              {total} questions · pass with 50%
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {submitted && (
              <div
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                  passed
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {score}/{total} · {Math.round(pct * 100)}%
              </div>
            )}
            {passed && (
              <Link
                to="/checkout/$slug"
                params={{ slug: course.slug }}
                search={{ plan: "cert", route: "exam", score: Math.round(pct * 100) }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Continue to checkout — ${course.certPrice} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <ol className="mt-6 space-y-5">
          {questions.map((q, qi) => {
            const chosen = answers[qi];
            return (
              <li key={qi} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-card-foreground">
                  {qi + 1}. {q.q}
                </p>
                <div className="mt-3 grid gap-1.5">
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    const isCorrect = q.answer === oi;
                    let cls = "border-border bg-background hover:bg-accent";
                    if (submitted) {
                      if (isCorrect) cls = "border-emerald-500/60 bg-emerald-500/10 text-foreground";
                      else if (isChosen) cls = "border-destructive/60 bg-destructive/10 text-foreground";
                      else cls = "border-border bg-background/60 text-muted-foreground";
                    } else if (isChosen) {
                      cls = "border-primary bg-primary/5 text-foreground";
                    }
                    return (
                      <label
                        key={oi}
                        className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${cls}`}
                      >
                        <input
                          type="radio"
                          name={`eq-${qi}`}
                          className="mt-0.5"
                          checked={isChosen}
                          disabled={submitted}
                          onChange={() => {
                            const next = [...answers];
                            next[qi] = oi;
                            setAnswers(next);
                          }}
                        />
                        <span className="flex-1">{opt}</span>
                        {submitted && isCorrect && <Check className="h-4 w-4 text-emerald-600" />}
                        {submitted && isChosen && !isCorrect && <X className="h-4 w-4 text-destructive" />}
                      </label>
                    );
                  })}
                </div>
                {submitted && q.explain && (
                  <p className="mt-2 text-xs text-muted-foreground">{q.explain}</p>
                )}
              </li>
            );
          })}
        </ol>

        {!submitted ? (
          <div className="mt-6 flex items-center gap-3">
            <button
              disabled={!allAnswered}
              onClick={() => {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
                recordExamAttempt({
                  data: { courseSlug: course.slug, score: Math.round(pct * 100), passed: pct >= PASS_THRESHOLD },
                }).catch((err) => reportLovableError(err instanceof Error ? err : new Error(String(err)), { boundary: "exam_attempt_log" }));
              }}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit exam
            </button>
            {!allAnswered && (
              <span className="text-xs text-muted-foreground">
                Answer all {total} questions to submit.
              </span>
            )}
          </div>
        ) : passed ? (
          <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-foreground">You passed!</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Great work — you scored {score}/{total} ({Math.round(pct * 100)}%). Complete checkout to
              receive your official {course.title} certificate.
            </p>
            <Link
              to="/checkout/$slug"
              params={{ slug: course.slug }}
              search={{ plan: "cert", route: "exam", score: Math.round(pct * 100) }}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue to checkout — ${course.certPrice} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-5">
            <h3 className="font-semibold text-foreground">Not quite — try again</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You scored {score}/{total} ({Math.round(pct * 100)}%). You need at least 50% to earn
              the certificate. Review the highlighted answers above, then retake the exam.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setAttempt((a) => a + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4" /> Retake exam
              </button>
              <Link
                to="/courses/$slug"
                params={{ slug: course.slug }}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Review the course first
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
