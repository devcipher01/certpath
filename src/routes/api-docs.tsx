import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Copy, CheckCircle2, Terminal, Globe, ShieldCheck } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/api-docs")({
  head: () => ({
    meta: [
      { title: "Certificate Verification API — CertPath" },
      { name: "description", content: "Programmatically verify CertPath certificates from any platform." },
    ],
  }),
  component: ApiDocsPage,
});

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-lg bg-zinc-950 text-zinc-100">
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded text-xs text-zinc-400 hover:text-zinc-100"
      >
        {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
      </button>
      <pre className="overflow-x-auto px-5 py-4 text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const FALLBACK_BASE = "https://certpath-gold.vercel.app";

// ── Example snippets ─────────────────────────────────────────────────────────

// These are functions so they're called inside the component at render time,
// where window.location.origin is always correct regardless of domain.
function getBase() {
  return typeof window !== "undefined" ? window.location.origin : FALLBACK_BASE;
}

// All snippet builders accept `base` so they're called inside the component
// at render time — window.location.origin is always correct there.

function buildSnippets(base: string) {
  const certUrl = `${base}/certificate/medical-transcriptionist/jane-doe?code=CERTPATH-A1B2-C3D4`;

  const curlExample = `# Option 1 — by certificate code
curl "${base}/api/verify?code=CERTPATH-A1B2-C3D4"

# Option 2 — by certificate profile URL
curl "${base}/api/verify?url=${encodeURIComponent(certUrl)}"`;

  const successResponse = `{
  "valid": true,
  "code": "CERTPATH-A1B2-C3D4",
  "recipientName": "Jane Doe",
  "courseTitle": "Medical Transcriptionist",
  "courseSlug": "medical-transcriptionist",
  "issuedAt": "2026-07-19T10:30:00.000Z",
  "verifiedAt": "2026-07-19T14:05:22.000Z",
  "profileUrl": "${certUrl}"
}`;

  const failResponse = `{
  "valid": false,
  "code": "CERTPATH-XXXX-XXXX",
  "error": "No certificate found with that code."
}`;

  const jsExample = `// Pass either the certificate code OR the full profile URL —
// both are accepted by the same endpoint.

async function verifyCertPath({ code, url }) {
  const params = code
    ? \`code=\${encodeURIComponent(code)}\`
    : \`url=\${encodeURIComponent(url)}\`;

  const res  = await fetch(\`${base}/api/verify?\${params}\`);
  const data = await res.json();

  if (data.valid) {
    console.log(\`✓ Verified: \${data.recipientName}\`);
    console.log(\`  Course:   \${data.courseTitle}\`);
    console.log(\`  Issued:   \${data.issuedAt}\`);
    console.log(\`  Profile:  \${data.profileUrl}\`);
  } else {
    console.log(\`✗ Invalid: \${data.error}\`);
  }

  return data;
}

// Usage examples:
verifyCertPath({ code: "CERTPATH-A1B2-C3D4" });
verifyCertPath({ url: "${certUrl}" });`;

  const pythonExample = `import requests
from datetime import datetime

def verify_certpath(*, code: str = "", url: str = "") -> dict:
    """Pass either code= or url= (full certificate profile URL)."""
    params = {"code": code} if code else {"url": url}
    resp = requests.get("${base}/api/verify", params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    if data["valid"]:
        issued = datetime.fromisoformat(data["issuedAt"].replace("Z", "+00:00"))
        print(f"✓ {data['recipientName']} — {data['courseTitle']} ({issued.date()})")
    else:
        print(f"✗ {data['error']}")

    return data

# Usage examples:
verify_certpath(code="CERTPATH-A1B2-C3D4")
verify_certpath(url="${certUrl}")`;

  const phpExample = `<?php
/**
 * Verify a CertPath certificate by code or by profile URL.
 * Pass exactly one of: $code or $profileUrl
 */
function verifyCertPath(string $code = "", string $profileUrl = ""): array {
    $param = $code
        ? http_build_query(["code" => $code])
        : http_build_query(["url"  => $profileUrl]);

    $response = file_get_contents("${base}/api/verify?" . $param);
    $data = json_decode($response, true);

    if ($data["valid"]) {
        echo "✓ {$data['recipientName']} — {$data['courseTitle']}\\n";
    } else {
        echo "✗ {$data['error']}\\n";
    }
    return $data;
}

// Usage examples:
verifyCertPath(code: "CERTPATH-A1B2-C3D4");
verifyCertPath(profileUrl: "${certUrl}");`;

  const embedExample = `<!-- Drop this snippet anywhere on your page.
     Works with either the code or the full certificate URL. -->
<div id="certpath-badge"></div>

<script>
  (async () => {
    // Use the certificate URL your user submitted to you
    const certUrl = "${certUrl}";
    const res  = await fetch(
      \`${base}/api/verify?url=\${encodeURIComponent(certUrl)}\`
    );
    const cert = await res.json();
    const el   = document.getElementById("certpath-badge");

    if (cert.valid) {
      el.innerHTML = \`
        <a href="\${cert.profileUrl}" target="_blank"
           style="display:inline-flex;align-items:center;gap:8px;
                  padding:8px 14px;border-radius:8px;
                  border:1px solid #d1fae5;background:#ecfdf5;
                  text-decoration:none;font-family:sans-serif;font-size:14px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="#059669" stroke-width="2.5">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span style="color:#065f46">
            ✓ Verified: \${cert.recipientName} · \${cert.courseTitle}
          </span>
        </a>\`;
    } else {
      el.textContent = "Certificate could not be verified.";
    }
  })();
</script>`;

  return { curlExample, successResponse, failResponse, jsExample, pythonExample, phpExample, embedExample };
}

function ApiDocsPage() {
  const [tab, setTab] = useState<"curl" | "js" | "python" | "php" | "embed">("curl");

  // Computed at render time so window.location.origin is always the live domain.
  const base = getBase();
  const { curlExample, successResponse, failResponse, jsExample, pythonExample, phpExample, embedExample } =
    buildSnippets(base);

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "curl", label: "cURL" },
    { id: "js", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "php", label: "PHP" },
    { id: "embed", label: "Embed badge" },
  ];

  const codeMap: Record<typeof tab, string> = {
    curl: curlExample,
    js: jsExample,
    python: pythonExample,
    php: phpExample,
    embed: embedExample,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">

        {/* Header */}
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Public API · No auth required
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Certificate Verification API</h1>
          <p className="mt-3 text-muted-foreground">
            Verify any CertPath certificate from your own platform, application, or website.
            Every certificate issued through CertPath is instantly queryable — no signup, no API key.
          </p>
        </div>

        {/* Endpoint */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">Endpoint</h2>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700">GET</span>
            <code className="text-sm text-foreground">{base}/api/verify</code>
          </div>
        </section>

        {/* Parameters */}
        <section className="mb-10">
          <h2 className="mb-1 text-lg font-semibold">Query parameters</h2>
          <p className="mb-3 text-sm text-muted-foreground">Supply <strong>one</strong> of the two parameters below — you don't need both.</p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Parameter</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Required</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3"><code className="font-mono font-medium text-foreground">code</code></td>
                  <td className="px-4 py-3 text-muted-foreground">string</td>
                  <td className="px-4 py-3 font-medium text-amber-600">One of</td>
                  <td className="px-4 py-3 text-muted-foreground">The validation code printed on the certificate (e.g. <code>CERTPATH-A1B2-C3D4</code>)</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="px-4 py-3"><code className="font-mono font-medium text-foreground">url</code></td>
                  <td className="px-4 py-3 text-muted-foreground">string</td>
                  <td className="px-4 py-3 font-medium text-amber-600">One of</td>
                  <td className="px-4 py-3 text-muted-foreground">The full certificate profile URL (e.g. <code>{base}/certificate/course/name?code=…</code>). The code is extracted automatically.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Response fields */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">Response fields</h2>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Field</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {[
                  ["valid", "boolean", "true if the certificate exists and has not been revoked"],
                  ["code", "string", "The normalised certificate code"],
                  ["recipientName", "string", "Full name on the certificate (only when valid)"],
                  ["courseTitle", "string", "Course the certificate was issued for (only when valid)"],
                  ["courseSlug", "string", "URL-friendly course identifier (only when valid)"],
                  ["issuedAt", "ISO 8601", "When the certificate was originally issued (only when valid)"],
                  ["verifiedAt", "ISO 8601", "Timestamp of this verification request (only when valid)"],
                  ["profileUrl", "string", "Canonical public URL for the certificate page (only when valid)"],
                  ["error", "string", "Human-readable reason (only when valid is false)"],
                ].map(([field, type, desc]) => (
                  <tr key={field}>
                    <td className="px-4 py-3"><code className="font-mono font-medium text-foreground">{field}</code></td>
                    <td className="px-4 py-3 text-muted-foreground">{type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Example responses */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Example responses</h2>
          <p className="mb-2 text-sm font-medium text-emerald-700">✓ Valid certificate</p>
          <CodeBlock code={successResponse} lang="json" />
          <p className="mb-2 mt-6 text-sm font-medium text-destructive">✗ Invalid certificate</p>
          <CodeBlock code={failResponse} lang="json" />
        </section>

        {/* Code examples */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">Code examples</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <CodeBlock code={codeMap[tab]} />
        </section>

        {/* CORS / rate limits */}
        <section className="mb-10 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Notes
          </div>
          <ul className="ml-1 list-disc space-y-1 pl-4">
            <li><strong>CORS:</strong> All origins are allowed — call this endpoint directly from browser JavaScript.</li>
            <li><strong>Authentication:</strong> None required. The API is intentionally public — certificates are designed to be shareable credentials.</li>
            <li><strong>Rate limiting:</strong> Please keep requests reasonable. Batch lookups aren't supported; query one certificate code per request.</li>
            <li><strong>Two ways to verify:</strong> pass <code>?code=CERTPATH-XXXX</code> or the full <code>?url={base}/certificate/…</code> — the code is extracted from the URL automatically.</li>
            <li><strong>Codes are case-insensitive:</strong> <code>certpath-a1b2-c3d4</code> and <code>CERTPATH-A1B2-C3D4</code> both work.</li>
          </ul>
        </section>

        {/* Link back */}
        <div className="text-center text-sm text-muted-foreground">
          <Link to="/certifications" className="text-primary hover:underline">Browse certifications</Link>
          {" · "}
          <Link to="/pricing" className="text-primary hover:underline">Find your certificate</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
