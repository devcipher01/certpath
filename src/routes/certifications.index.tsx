import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { COURSES } from "@/data/courses";
import { Award, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/certifications/")({
  head: () => ({
    meta: [
      { title: "Certifications — CertPath" },
      { name: "description", content: "Cert-only options from $9. Take an exam or purchase-and-attest to earn a downloadable certificate." },
      { property: "og:title", content: "Certifications from $9 — CertPath" },
      { property: "og:description", content: "Skip the course and get certified now via exam or attestation." },
    ],
  }),
  component: CertsPage,
});

function CertsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Certification-only options</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Already know the material? Get the credential without taking the full course. Choose an
              exam route or a purchase-and-attest route at checkout.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((c) => (
              <Link
                key={c.slug}
                to="/certifications/$slug"
                params={{ slug: c.slug }}
                className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{c.category}</Badge>
                </div>
                <h3 className="mt-3 font-semibold text-card-foreground group-hover:text-primary">
                  {c.title} Certification
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.tagline}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  <Award className="h-4 w-4" /> Get certified <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
