import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { COURSES, CATEGORIES } from "@/data/courses";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "All Courses — CertPath" },
      { name: "description", content: "Browse 25+ short courses across healthcare, business, tech, creative and lifestyle." },
      { property: "og:title", content: "All Courses — CertPath" },
      { property: "og:description", content: "Browse short career-ready courses with affordable certifications." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const filtered = COURSES.filter((c) => {
    const matchesCat = cat === "All" || c.category === cat;
    const matchesQ = !q || (c.title + " " + c.tagline).toLowerCase().includes(q.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">All courses</h1>
          <p className="mt-1 text-muted-foreground">{COURSES.length} programs with optional certification.</p>
        </div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search courses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {(["All", ...CATEGORIES] as string[]).map((c) => (
              <Badge
                key={c}
                variant={cat === c ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setCat(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground">No courses match your search.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
