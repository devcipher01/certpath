import { createServerFn } from "@tanstack/react-start";
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { certificates } from "@/server/schema";

const verifySchema = z.object({
  courseSlug: z.string().min(1),
  code: z.string().trim().min(1),
});

// Looks up a certificate by its database-issued validation code — the
// source of truth is the `certificates` table, not anything computable
// client-side, so a code only verifies if it was actually issued.
export const verifyCertificate = createServerFn({ method: "GET" })
  .validator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const normalizedCode = data.code.trim().toUpperCase();
    const [certificate] = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.courseSlug, data.courseSlug), eq(certificates.code, normalizedCode)))
      .limit(1);

    if (!certificate || certificate.revoked) {
      return { valid: false as const };
    }

    return {
      valid: true as const,
      recipientName: certificate.recipientName,
      courseTitle: certificate.courseTitle,
      issuedAt: certificate.issuedAt.toISOString(),
    };
  });

// ─── Certificate recovery ─────────────────────────────────────────────────────
// Lets someone recover a lost cert URL by searching with their name or email.
// Email → exact match (privacy). Name → case-insensitive partial match.
const lookupSchema = z.object({
  query: z.string().trim().min(2),
});

export const lookupCertsByContact = createServerFn({ method: "GET" })
  .validator((data: unknown) => lookupSchema.parse(data))
  .handler(async ({ data }) => {
    const q = data.query.trim();
    const isEmail = q.includes("@");

    const rows = await db
      .select({
        code: certificates.code,
        courseSlug: certificates.courseSlug,
        courseTitle: certificates.courseTitle,
        recipientName: certificates.recipientName,
        issuedAt: certificates.issuedAt,
      })
      .from(certificates)
      .where(
        and(
          isEmail
            ? eq(certificates.email, q.toLowerCase())
            : ilike(certificates.recipientName, `%${q}%`),
          eq(certificates.revoked, false),
        ),
      )
      .limit(20);

    return rows.map((r) => ({
      code: r.code,
      courseSlug: r.courseSlug,
      courseTitle: r.courseTitle,
      recipientName: r.recipientName,
      issuedAt: r.issuedAt.toISOString(),
    }));
  });
