import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/start-server-core";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { certificates, orders, pendingCheckouts } from "@/server/schema";
import { getCourse } from "@/data/courses";
import { getWhopPlanId } from "@/data/whop-plans";
import { callWhop, getCompanyId } from "@/server/whopClient";

// ── helpers ────────────────────────────────────────────────────────────────

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function generateCode(): string {
  const bytes = crypto.randomBytes(8);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}`;
}

async function mintCertificate(args: {
  courseSlug: string;
  courseTitle: string;
  name: string;
  email: string;
  orderId: number;
  examScore?: number | null;
}): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [cert] = await db
        .insert(certificates)
        .values({
          code: generateCode(),
          courseSlug: args.courseSlug,
          courseTitle: args.courseTitle,
          recipientName: args.name,
          email: args.email,
          orderId: args.orderId,
          examScore: args.examScore ?? null,
        })
        .returning();
      return cert.code;
    } catch (err) {
      // Retry on unique violation (code collision — astronomically unlikely but handled)
      if (!(err instanceof Error) || !("code" in err) || (err as { code?: string }).code !== "23505") {
        throw err;
      }
    }
  }
  throw new Error("Could not generate a unique certificate code after several attempts.");
}

// ── createWhopCheckout ─────────────────────────────────────────────────────
// Step 1 of the checkout flow: create a pending record and a Whop checkout
// configuration, then return the Whop-hosted payment URL.

const createWhopCheckoutSchema = z.object({
  courseSlug: z.string().min(1),
  plan: z.enum(["cert", "course", "bundle"]),
  route: z.enum(["exam", "attest"]).optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  examScore: z.number().int().min(0).max(100).optional(),
});

export const createWhopCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => createWhopCheckoutSchema.parse(data))
  .handler(async ({ data }) => {
    const course = getCourse(data.courseSlug);
    if (!course) throw new Error(`Unknown course: ${data.courseSlug}`);

    const amountDollars =
      data.plan === "course"
        ? course.coursePrice
        : data.plan === "bundle"
          ? course.bundlePrice
          : course.certPrice;

    const whopPlanId = getWhopPlanId(data.plan, amountDollars);

    // Unique opaque token — used as the redirect URL key so we can look up the
    // pending checkout on return without exposing any internal IDs.
    const token = crypto.randomBytes(24).toString("base64url");

    // Derive the return URL. On Vercel, VERCEL_URL is the canonical deployment
    // host; fall back to the incoming request origin for dev / other platforms.
    let origin: string;
    try {
      const vercelUrl = process.env.VERCEL_URL; // e.g. "my-app.vercel.app"
      origin = vercelUrl ? `https://${vercelUrl}` : new URL(getRequestUrl()).origin;
    } catch {
      origin = new URL(getRequestUrl()).origin;
    }
    const redirectUrl = `${origin}/checkout/return?token=${token}`;

    // Create the Whop hosted checkout configuration.
    const checkoutResp = await callWhop<{ id: string; purchase_url: string }>(
      "POST",
      "api/v1/checkout_configurations",
      { plan_id: whopPlanId, redirect_url: redirectUrl },
    );

    if (!checkoutResp.id || !checkoutResp.purchase_url) {
      throw new Error("Whop did not return a valid checkout configuration.");
    }

    // Persist the pending checkout so finalization can verify and complete it.
    await db.insert(pendingCheckouts).values({
      token,
      courseSlug: course.slug,
      courseTitle: course.title,
      plan: data.plan,
      route: data.route ?? null,
      name: data.name,
      email: data.email,
      amountCents: Math.round(amountDollars * 100),
      whopPlanId,
      whopCheckoutConfigId: checkoutResp.id,
      examScore: data.examScore ?? null,
      status: "pending",
    });

    return { purchaseUrl: checkoutResp.purchase_url };
  });

// ── finalizeCheckout ───────────────────────────────────────────────────────
// Step 2 of the checkout flow: called from /checkout/return after Whop
// redirects the buyer back. Verifies the payment server-side, then creates
// the order and (if applicable) the certificate.

const finalizeCheckoutSchema = z.object({
  token: z.string().min(1),
});

export const finalizeCheckout = createServerFn({ method: "GET" })
  .validator((data: unknown) => finalizeCheckoutSchema.parse(data))
  .handler(async ({ data }) => {
    // Look up the pending checkout.
    const [pending] = await db
      .select()
      .from(pendingCheckouts)
      .where(eq(pendingCheckouts.token, data.token))
      .limit(1);

    if (!pending) throw new Error("Checkout session not found.");

    // If already confirmed (e.g. user refreshed the return page), return
    // the cached result rather than creating duplicate records.
    if (pending.status === "confirmed" && pending.orderId) {
      const [cert] = await db
        .select({ code: certificates.code })
        .from(certificates)
        .where(eq(certificates.orderId, pending.orderId))
        .limit(1);

      return {
        orderId: pending.orderId,
        certificateCode: cert?.code ?? null,
        courseSlug: pending.courseSlug,
        courseName: pending.courseTitle,
        plan: pending.plan as "cert" | "course" | "bundle",
        name: pending.name,
        email: pending.email,
      };
    }

    if (pending.status !== "pending") {
      throw new Error("This checkout session has already been processed.");
    }

    // Verify the payment with Whop — do not trust the redirect alone.
    const companyId = getCompanyId();
    const paymentsResp = await callWhop<{
      data: Array<{ id: string; status: string; amount?: number }>;
    }>(
      "GET",
      `api/v1/payments?company_id=${companyId}&checkout_configuration_ids[]=${pending.whopCheckoutConfigId}`,
    );

    // Only accept explicit terminal-success statuses. Whop uses "paid" for
    // settled one-time payments; "succeeded" is included defensively in case
    // of API version variation. Any other status (pending, created, failed,
    // refunded, voided, disputed …) is treated as not yet settled.
    const SETTLED_STATUSES = new Set(["paid", "succeeded"]);
    const payment = (paymentsResp.data ?? []).find((p) => SETTLED_STATUSES.has(p.status));

    if (!payment) {
      throw new Error(
        "Payment not yet confirmed by Whop. Please wait a moment, then refresh this page.",
      );
    }

    // Defense-in-depth: verify the settled amount matches what we expect.
    // Whop returns amounts in decimal dollars; pending stores cents.
    const expectedCents = pending.amountCents;
    const paidCents = Math.round((payment.amount ?? 0) * 100);
    if (paidCents > 0 && paidCents !== expectedCents) {
      throw new Error(
        `Payment amount mismatch (expected ${(expectedCents / 100).toFixed(2)}, got ${(paidCents / 100).toFixed(2)}). Contact support.`,
      );
    }

    // Create the order record.
    const [order] = await db
      .insert(orders)
      .values({
        courseSlug: pending.courseSlug,
        courseTitle: pending.courseTitle,
        plan: pending.plan,
        route: pending.route,
        name: pending.name,
        email: pending.email,
        amountCents: pending.amountCents,
        whopPlanId: pending.whopPlanId,
        whopOrderId: payment.id,
      })
      .returning();

    // Mint a certificate for cert/bundle plans.
    let certificateCode: string | null = null;
    if (pending.plan === "cert" || pending.plan === "bundle") {
      certificateCode = await mintCertificate({
        courseSlug: pending.courseSlug,
        courseTitle: pending.courseTitle,
        name: pending.name,
        email: pending.email,
        orderId: order.id,
        examScore: pending.examScore,
      });
    }

    // Mark the pending checkout as confirmed.
    await db
      .update(pendingCheckouts)
      .set({ status: "confirmed", orderId: order.id })
      .where(eq(pendingCheckouts.token, data.token));

    return {
      orderId: order.id,
      certificateCode,
      courseSlug: pending.courseSlug,
      courseName: pending.courseTitle,
      plan: pending.plan as "cert" | "course" | "bundle",
      name: pending.name,
      email: pending.email,
    };
  });
