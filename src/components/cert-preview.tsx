import { Award, ShieldCheck } from "lucide-react";

export function CertPreview({
  courseTitle,
  recipientName = "Your Name Here",
  date,
  hideNote = false,
}: {
  courseTitle: string;
  recipientName?: string;
  date?: string;
  hideNote?: boolean;
}) {
  const issued =
    date ??
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div id="cert-print-target" className="relative mx-auto w-full max-w-2xl">
      {/* Faux page shadow */}
      <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-md bg-black/10 blur-[2px]" aria-hidden />
      <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-md border border-border bg-[#fffaf2] p-6 shadow-md sm:p-10">
        {/* Warm corner rosettes */}
        <div className="absolute left-3 top-3 h-8 w-8 rounded-full bg-[#e6b85c] shadow-sm" aria-hidden />
        <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-[#e6b85c] shadow-sm" aria-hidden />
        <div className="absolute bottom-3 left-3 h-8 w-8 rounded-full bg-[#e6b85c] shadow-sm" aria-hidden />
        <div className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-[#e6b85c] shadow-sm" aria-hidden />

        {/* Ornamental border */}
        <div className="absolute inset-3 rounded border-2 border-[#2d6a9f]/30" aria-hidden />
        <div className="absolute inset-4 rounded border border-[#2d6a9f]/20" aria-hidden />

        {/* Watermark seal — always visible (opacity keeps it subtle) */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 sm:right-12" aria-hidden>
          <svg width="120" height="120" viewBox="0 0 120 120" className="sm:h-40 sm:w-40">
            <circle cx="60" cy="60" r="56" fill="none" stroke="#2d6a9f" strokeWidth="2" />
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e6b85c" strokeWidth="2" strokeDasharray="6 4" />
            <path d="M60 18 L66 54 L102 60 L66 66 L60 102 L54 66 L18 60 L54 54 Z" fill="#2d6a9f" opacity="0.4" />
          </svg>
        </div>

        <div className="relative flex h-full flex-col items-center justify-between text-center text-[#1f2b3e]">
          {/* Header */}
          <div className="flex items-center gap-2 text-[#2d6a9f]">
            <Award className="h-6 w-6" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em]">CertPath</span>
          </div>

          {/* Main body */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#8b6e3c] sm:text-xs">
              Certificate of Completion
            </p>
            <p className="mt-3 text-xs font-medium text-[#4a5a6c] sm:text-sm">This certifies that</p>
            <h3 className="mt-1 font-serif text-2xl italic text-[#1f2b3e] sm:text-4xl">
              {recipientName}
            </h3>
            <p className="mt-3 text-sm font-medium text-[#2d3a49] sm:text-base">
              has successfully completed the requirements for
            </p>
            <h4 className="mt-1.5 text-lg font-semibold text-[#2d6a9f] sm:text-2xl">
              {courseTitle}
            </h4>
          </div>

          {/* Footer row: signature | verified | date */}
          <div className="flex w-full items-end justify-between text-[10px] text-[#5b6b7c] sm:text-xs">
            {/* Handwritten-style signature */}
            <div className="text-left">
              <div className="border-b border-[#e6b85c]/70 pb-0.5">
                <span
                  style={{ fontFamily: "cursive", fontSize: "1.15rem", lineHeight: 1.1 }}
                  className="text-[#1f2b3e]"
                >
                  CertPath
                </span>
              </div>
              <div className="mt-1 text-[8px] uppercase tracking-widest text-[#5b6b7c] sm:text-[9px]">
                Director, CertPath
              </div>
            </div>

            {/* Verified badge */}
            <div className="flex items-center gap-1 text-[#2d6a9f]">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-medium">Verified</span>
            </div>

            {/* Date */}
            <div className="text-right">
              <div className="border-b border-[#e6b85c]/70 pb-0.5 text-[#1f2b3e]">{issued}</div>
              <div className="mt-1">Date issued</div>
            </div>
          </div>
        </div>
      </div>

      {!hideNote && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Preview — your certificate will be delivered as a downloadable PNG.
        </p>
      )}
    </div>
  );
}
