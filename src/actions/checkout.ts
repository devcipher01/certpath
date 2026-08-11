import { createServerFn } from "@tanstack/react-start";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { certificates, orders, pendingCheckouts } from "@/server/schema";
import { getCourse } from "@/data/courses";
import { getWhopPlanId } from "@/data/whop-plans";
import { callWhop, getCompanyId } from "@/server/whopClient";
import { callPaystack } from "@/server/paystackClient";
import { CANONICAL_SITE_ORIGIN } from "@/lib/site";
import { usdToNgn } from "@/data/payment";

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

// ── createCheckout ─────────────────────────────────────────────────────────
// Step 1 of the checkout flow. Nigerian buyers use Paystack in NGN; every
// other country uses the existing Whop USD checkout.

const createCheckoutSchema = z.object({
  courseSlug: z.string().min(1),
  plan: z.enum(["cert", "course", "bundle"]),
  route: z.enum(["exam", "attest"]).optional(),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  country: z.string().trim().length(2).toUpperCase().default("US"),
  examScore: z.number().int().min(0).max(100).optional(),
});

export const createCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => createCheckoutSchema.parse(data))
  .handler(async ({ data }) => {
    const course = getCourse(data.courseSlug);
    if (!course) throw new Error(`Unknown course: ${data.courseSlug}`);

    const amountDollars =
      data.plan === "course"
        ? course.coursePrice
        : data.plan === "bundle"
          ? course.bundlePrice
          : course.certPrice;

    // Unique opaque token — used as the redirect URL key so we can look up the
    // pending checkout on return without exposing any internal IDs.
    const token = crypto.randomBytes(24).toString("base64url");
    const isNigeria = data.country === "NG";
    const currency = isNigeria ? "NGN" : "USD";
    const amountCents = isNigeria ? usdToNgn(amountDollars) * 100 : Math.round(amountDollars * 100);

    if (isNigeria) {
      const checkoutResp = await callPaystack<{
        status: boolean;
        message: string;
        data?: { authorization_url: string; reference: string };
      }>("POST", "transaction/initialize", {
        email: data.email,
        amount: amountCents,
        currency,
        reference: token,
        callback_url: `${CANONICAL_SITE_ORIGIN}/checkout/return?token=${encodeURIComponent(token)}`,
        metadata: {
          courseSlug: course.slug,
          plan: data.plan,
          name: data.name,
          country: data.country,
        },
      });

      if (!checkoutResp.status || !checkoutResp.data?.authorization_url) {
        throw new Error(`Paystack did not return a valid checkout URL. ${checkoutResp.message ?? ""}`.trim());
      }

      await db.insert(pendingCheckouts).values({
        token,
        courseSlug: course.slug,
        courseTitle: course.title,
        plan: data.plan,
        route: data.route ?? null,
        name: data.name,
        email: data.email,
        amountCents,
        country: data.country,
        currency,
        paymentProvider: "paystack",
        paymentReference: checkoutResp.data.reference ?? token,
        examScore: data.examScore ?? null,
        status: "pending",
      });

      return { purchaseUrl: checkoutResp.data.authorization_url, provider: "paystack" as const };
    }

    const whopPlanId = getWhopPlanId(data.plan, amountDollars);
    const redirectUrl = `${CANONICAL_SITE_ORIGIN}/checkout/return?token=${encodeURIComponent(token)}`;
    const checkoutResp = await callWhop<{ id: string; purchase_url: string }>(
      "POST",
      "api/v1/checkout_configurations",
      { plan_id: whopPlanId, redirect_url: redirectUrl },
    );

    if (!checkoutResp.id || !checkoutResp.purchase_url) {
      throw new Error("Whop did not return a valid checkout configuration.");
    }

    await db.insert(pendingCheckouts).values({
      token,
      courseSlug: course.slug,
      courseTitle: course.title,
      plan: data.plan,
      route: data.route ?? null,
      name: data.name,
      email: data.email,
      amountCents,
      country: data.country,
      currency,
      paymentProvider: "whop",
      whopPlanId,
      whopCheckoutConfigId: checkoutResp.id,
      examScore: data.examScore ?? null,
      status: "pending",
    });

    return { purchaseUrl: checkoutResp.purchase_url, provider: "whop" as const };
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

    let whopOrderId: string | null = null;
    let paymentReference: string | null = pending.paymentReference;

    if (pending.paymentProvider === "paystack") {
      const reference = pending.paymentReference ?? pending.token;
      const verifyResp = await callPaystack<{
        status: boolean;
        message: string;
        data?: { status: string; amount: number; currency: string; reference: string };
      }>("GET", `transaction/verify/${encodeURIComponent(reference)}`);

      const payment = verifyResp.data;
      if (!verifyResp.status || !payment || payment.status !== "success") {
        throw new Error(
          "Paystack has not confirmed this payment yet. Please wait a moment, then refresh this page.",
        );
      }
      if (
        payment.amount !== pending.amountCents ||
        payment.currency.toUpperCase() !== pending.currency.toUpperCase()
      ) {
        throw new Error("Payment amount mismatch. Contact support before trying again.");
      }
      paymentReference = payment.reference;
    } else {
      // Verify the payment with Whop — do not trust the redirect alone.
      const companyId = getCompanyId();
      const paymentsResp = await callWhop<{
        data: Array<{ id: string; status: string; amount?: number }>;
      }>(
        "GET",
        `api/v1/payments?company_id=${companyId}&checkout_configuration_ids[]=${pending.whopCheckoutConfigId}`,
      );

      const SETTLED_STATUSES = new Set(["paid", "succeeded"]);
      const payment = (paymentsResp.data ?? []).find((p) => SETTLED_STATUSES.has(p.status));

      if (payment) {
        const expectedCents = pending.amountCents;
        const paidCents = Math.round((payment.amount ?? 0) * 100);
        if (paidCents > 0 && paidCents !== expectedCents) {
          throw new Error(
            `Payment amount mismatch (expected ${(expectedCents / 100).toFixed(2)}, got ${(paidCents / 100).toFixed(2)}). Contact support.`,
          );
        }
        whopOrderId = payment.id;
      }

      if (!whopOrderId) {
        const membershipsResp = await callWhop<{
          data: Array<{ id: string; status: string; checkout_configuration_id: string | null }>;
        }>(
          "GET",
          `api/v1/memberships?company_id=${companyId}&plan_ids[]=${pending.whopPlanId}&first=20`,
        );

        const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due", "completed"]);
        const membership = (membershipsResp.data ?? []).find(
          (m) =>
            m.checkout_configuration_id === pending.whopCheckoutConfigId &&
            ACTIVE_STATUSES.has(m.status),
        );

        if (membership) whopOrderId = membership.id;
      }
    }

    if (pending.paymentProvider === "whop" && !whopOrderId) {
      throw new Error(
        "Payment not yet confirmed by Whop. Please wait a moment, then refresh this page.",
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
        country: pending.country,
        currency: pending.currency,
        paymentProvider: pending.paymentProvider,
        paymentReference,
        whopPlanId: pending.whopPlanId,
        whopOrderId,
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
