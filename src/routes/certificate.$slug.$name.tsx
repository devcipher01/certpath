import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getCourse } from "@/data/courses";
import { CertPreview } from "@/components/cert-preview";
import { verifyCertificate } from "@/actions/certificates";
import { ShieldCheck, ShieldAlert, Download, Loader2 } from "lucide-react";
import { downloadCertAsImage } from "@/lib/download-cert";
import { reportLovableError } from "@/lib/lovable-error-reporting";

const searchSchema = z.object({
  code: z.string().min(1),
});

export const Route = createFileRoute("/certificate/$slug/$name")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ code: search.code }),
  loader: async ({ params, deps }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    const result = await verifyCertificate({ data: { courseSlug: params.slug, code: deps.code } });
    return { course, result };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Certificate — CertPath" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `Certificate — ${loaderData.course.title} | CertPath` },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  errorComponent: CertificateError,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      Certificate not found. <Link to="/courses" className="text-primary underline">Browse courses</Link>
    </div>
  ),
  component: CertificatePage,
});

function CertificateError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => reportLovableError(error, { boundary: "certificate_route" }), [error]);
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <button
        onClick={() => { router.invalidate(); reset(); }}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}

function CertificatePage() {
  const { course, result } = Route.useLoaderData() as {
    course: import("@/data/courses").Course;
    result: Awaited<ReturnType<typeof verifyCertificate>>;
  };
  const { code } = Route.useSearch();
  const [downloading, setDownloading] = useState(false);

  if (!result.valid) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>
              This validation code doesn't match a certificate on file for {course.title}. Double-check
              the link, or ask the recipient to resend it from their receipt.
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/courses" className="text-primary hover:underline">
              Browse courses
            </Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const issuedDate = new Date(result.issuedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>
            This certificate is <strong>verified</strong> — issued by CertPath for {result.courseTitle}.
          </span>
        </div>

        <CertPreview courseTitle={result.courseTitle} recipientName={result.recipientName} date={issuedDate} />

        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <div className="rounded-md border border-dashed border-border bg-card px-4 py-2 text-xs text-muted-foreground">
            Validation code: <code className="font-semibold text-foreground">{code}</code>
          </div>
          <button
            type="button"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                await downloadCertAsImage(`certpath-${course.slug}.png`);
              } finally {
                setDownloading(false);
              }
            }}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
          >
            {downloading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            ) : (
              <><Download className="h-4 w-4" /> Download Certificate</>
            )}
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Anyone with this link can verify this certificate — share it on LinkedIn, a resume, or with
          an employer.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
