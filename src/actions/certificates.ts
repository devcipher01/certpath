import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
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
