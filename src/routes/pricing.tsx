import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CertPath" },
      { name: "description", content: "Simple, affordable pricing. Certifications from $9, courses from $9, bundles up to $19." },
      { property: "og:title", content: "Pricing — CertPath" },
      { property: "og:description", content: "Certifications from $9. Courses from $9. Bundles up to $19." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Cert only",
    price: 9,
    to: 15,
    blurb: "Skip the course. Take the exam or attest and get your certificate.",
    features: ["Downloadable PDF cert", "Verification ID", "Exam or attestation route", "Instant delivery"],
  },
  {
    name: "Course only",
    price: 9,
    to: 19,
    blurb: "Learn the material at your own pace with full tutorials.",
    features: ["All video tutorials", "Practice questions", "Downloadable notes", "Lifetime access"],
  },
  {
    name: "Course + Cert",
    price: 12,
    to: 19,
    blurb: "Best value — learn everything and get certified.",
    features: ["Everything in Course", "Certification included", "Priority support", "Best value"],
    highlight: true,
  },
];

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-foreground">Simple, honest pricing</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Every course and certification is priced between $9 and $19. No subscriptions.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-xl border p-6 ${t.highlight ? "border-primary bg-primary/5" : "border-border bg-card"}`}
            >
              <h3 className="font-semibold text-card-foreground">{t.name}</h3>
              <div className="mt-2 text-3xl font-semibold">
                ${t.price}
                <span className="text-base font-normal text-muted-foreground"> – ${t.to}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/courses"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
                  t.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                Browse courses
              </Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
