import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { COURSES } from "@/data/courses";
import { Award, BookOpen, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CertPath — Affordable Courses & Certifications from $9" },
      { name: "description", content: "Take short online courses and earn a certification in medical, business, tech, creative and lifestyle fields. Cert-only or full course options from $9." },
      { property: "og:title", content: "CertPath — Courses & Certifications from $9" },
      { property: "og:description", content: "Short courses and low-cost certifications for career-ready skills." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = COURSES.slice(0, 6);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="mx-auto max-w-6xl px-4 py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Certifications from $9 · Courses from $9
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Get certified in weeks, not years.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Short, focused courses with an option to grab the certification alone — perfect if you
              already know the skill. Medical transcription, coding, tech, business and more.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Browse courses <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/certifications"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
              >
                Cert-only options
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: BookOpen, title: "Take the course", body: "Video tutorials, reading, and practice for each module." },
              { icon: Award, title: "Get certified", body: "Pass a short exam or purchase the cert directly with an attestation." },
              { icon: ShieldCheck, title: "Share your credential", body: "Downloadable PDF cert with verification ID for employers." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-card-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Featured programs</h2>
              <p className="text-sm text-muted-foreground">Popular tracks people start with.</p>
            </div>
            <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
              See all {COURSES.length} →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center">
            <h2 className="text-3xl font-semibold text-foreground">Already know the material?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Skip the course and go straight to certification. Pick a quick proficiency exam or a
              purchase-and-attest option — from $9.
            </p>
            <Link
              to="/certifications"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              View certification-only options <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      
    </div>
  );
}
