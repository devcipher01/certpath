import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">CertPath</span>
        </Link>
        <nav className="flex items-center gap-3 text-xs sm:gap-6 sm:text-sm">
          <Link to="/courses" className="text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
            Courses
          </Link>
          <Link to="/certifications" className="text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
            Certifications
          </Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground [&.active]:text-foreground [&.active]:font-medium">
            Find Cert
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
        <div>© {new Date().getFullYear()} CertPath. All rights reserved.</div>
        <div className="flex gap-4">
          <Link to="/courses" className="hover:text-foreground">Courses</Link>
          <Link to="/certifications" className="hover:text-foreground">Certifications</Link>
          <Link to="/pricing" className="hover:text-foreground">Find Cert</Link>
        </div>
      </div>
    </footer>
  );
}
