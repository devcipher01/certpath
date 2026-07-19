import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { Pool } from "pg";

// ── Public certificate verification API ──────────────────────────────────────
// Intercepted here before TanStack router so it never touches the SSR pipeline.
// Uses a raw pg Pool (no Drizzle) to avoid the **/server/** import-protection
// rule that would block importing from src/server/*.

declare global {
  // eslint-disable-next-line no-var
  var __verifyPool: Pool | undefined;
}

function getVerifyPool(): Pool {
  if (!globalThis.__verifyPool) {
    const cs = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
    if (!cs) throw new Error("No DB connection string configured.");
    globalThis.__verifyPool = new Pool({
      connectionString: cs,
      ssl: cs.includes("supabase") ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalThis.__verifyPool;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function apiJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), { status, headers: CORS });
}

async function handleVerifyApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.pathname !== "/api/verify") return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== "GET") {
    return apiJson({ valid: false, error: "Method not allowed. Use GET." }, 405);
  }

  const code = url.searchParams.get("code")?.trim().toUpperCase() ?? "";

  if (!code) {
    return apiJson(
      {
        valid: false,
        error: "Missing required query parameter: code",
        usage: "GET /api/verify?code=CERTPATH-XXXX-XXXX",
      },
      400,
    );
  }

  try {
    const pool = getVerifyPool();
    const result = await pool.query(
      `SELECT code, course_slug, course_title, recipient_name, issued_at, revoked
       FROM certificates
       WHERE code = $1
       LIMIT 1`,
      [code],
    );

    if (result.rows.length === 0) {
      return apiJson({ valid: false, code, error: "No certificate found with that code." });
    }

    const cert = result.rows[0];

    if (cert.revoked) {
      return apiJson({ valid: false, code, error: "This certificate has been revoked." });
    }

    const origin = `${url.protocol}//${url.host}`;
    const nameSlug = (cert.recipient_name as string)
      .toLowerCase()
      .replace(/\s+/g, "-");
    const profileUrl = `${origin}/certificate/${cert.course_slug}/${nameSlug}?code=${cert.code}`;

    return apiJson({
      valid: true,
      code: cert.code,
      recipientName: cert.recipient_name,
      courseTitle: cert.course_title,
      courseSlug: cert.course_slug,
      issuedAt: (cert.issued_at as Date).toISOString(),
      verifiedAt: new Date().toISOString(),
      profileUrl,
    });
  } catch (err) {
    console.error("[verify-api] DB error:", err);
    return apiJson(
      { valid: false, error: "Verification service unavailable. Try again shortly." },
      503,
    );
  }
}

// ── TanStack / SSR handler ────────────────────────────────────────────────────

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Public JSON API — handled before the TanStack router
      const apiResponse = await handleVerifyApi(request);
      if (apiResponse) return apiResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
