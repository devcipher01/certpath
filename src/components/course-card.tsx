import { Link } from "@tanstack/react-router";
import type { Course } from "@/data/courses";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Award } from "lucide-react";

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <Link to="/courses/$slug" params={{ slug: course.slug }} className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <Badge variant="secondary">{course.category}</Badge>
          <span className="text-xs text-muted-foreground">{course.level}</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-lg font-semibold leading-snug text-card-foreground group-hover:text-primary">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{course.tagline}</p>
          <div className="mt-auto flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration}</span>
            <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.lessons} lessons</span>
          </div>
        </div>
      </Link>
      <div className="border-t border-border p-3">
        <Link
          to="/certifications/$slug"
          params={{ slug: course.slug }}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Award className="h-4 w-4" /> Get certified
        </Link>
      </div>
    </div>
  );
}
