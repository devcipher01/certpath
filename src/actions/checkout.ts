import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/server/db";
import { certificates, orders } from "@/server/schema";
import { getCourse } from "@/data/courses";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — avoids ambiguous chars

function generateCode(): string {
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}`;
}

const submitOrderSchema = z.object({
  courseSlug: z.string().min(1),
  plan: z.enum(["cert", "course", "bundle"]),
  route: z.enum(["exam", "attest"]).optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  examScore: z.number().int().min(0).max(100).optional(),
});

// Simulates what a real Whop purchase webhook would trigger: record the
// order, and — for cert/bundle plans — mint a certificate with a unique
// validation code stored in the database (not derivable client-side).
export const submitOrder = createServerFn({ method: "POST" })
  .validator((data: unknown) => submitOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const course = getCourse(data.courseSlug);
    if (!course) {
      throw new Error(`Unknown course: ${data.courseSlug}`);
    }

    const amountDollars =
      data.plan === "course" ? course.coursePrice : data.plan === "bundle" ? course.bundlePrice : course.certPrice;
    const whopPlanId =
      data.plan === "course" ? course.whopPlanCourse : data.plan === "bundle" ? course.whopPlanBundle : course.whopPlanCert;

    const [order] = await db
      .insert(orders)
      .values({
        courseSlug: course.slug,
        courseTitle: course.title,
        plan: data.plan,
        route: data.route ?? null,
        name: data.name,
        email: data.email,
        amountCents: Math.round(amountDollars * 100),
        whopPlanId,
      })
      .returning();

    let certificateCode: string | null = null;
    if (data.plan === "cert" || data.plan === "bundle") {
      for (let attempt = 0; attempt < 5 && !certificateCode; attempt++) {
        try {
          const [certificate] = await db
            .insert(certificates)
            .values({
              code: generateCode(),
              courseSlug: course.slug,
              courseTitle: course.title,
              recipientName: data.name,
              email: data.email,
              orderId: order.id,
              examScore: data.examScore ?? null,
            })
            .returning();
          certificateCode = certificate.code;
        } catch (err) {
          // Unique violation on the (astronomically unlikely) code collision — retry with a new code.
          if (!(err instanceof Error) || !("code" in err) || (err as { code?: string }).code !== "23505") {
            throw err;
          }
        }
      }
      if (!certificateCode) {
        throw new Error("Could not generate a unique certificate code after several attempts.");
      }
    }

    return { orderId: order.id, certificateCode };
  });
