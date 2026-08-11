// Database schema (Drizzle ORM, PostgreSQL). Lives under src/server/ — the
// TanStack Start plugin's importProtection config blocks client code from
// ever importing files in this folder, so it's safe to keep secrets/queries
// here without worrying about them leaking into the browser bundle.
import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";

export const PLAN_VALUES = ["cert", "course", "bundle"] as const;
export type Plan = (typeof PLAN_VALUES)[number];

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  courseSlug: text("course_slug").notNull(),
  courseTitle: text("course_title").notNull(),
  plan: text("plan").notNull(), // "cert" | "course" | "bundle"
  route: text("route"), // "exam" | "attest" | null
  name: text("name").notNull(),
  email: text("email").notNull(),
  // Minor units in the order currency: USD cents for Whop, NGN kobo for Paystack.
  amountCents: integer("amount_cents").notNull(),
  country: text("country").notNull().default("US"),
  currency: text("currency").notNull().default("USD"),
  paymentProvider: text("payment_provider").notNull().default("whop"),
  paymentReference: text("payment_reference"),
  whopPlanId: text("whop_plan_id"),
  // Populated once a real Whop webhook/integration is wired up; null while simulated.
  whopOrderId: text("whop_order_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  courseSlug: text("course_slug").notNull(),
  courseTitle: text("course_title").notNull(),
  recipientName: text("recipient_name").notNull(),
  email: text("email").notNull(),
  orderId: integer("order_id").references(() => orders.id),
  examScore: integer("exam_score"), // percentage, null for attestation route
  revoked: boolean("revoked").notNull().default(false),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

// Created right before redirecting a buyer to a hosted checkout. Holds
// the order details we can't trust the redirect URL/query params to carry
// safely, keyed by an opaque token. Consumed (finalized) once we've verified
// with the selected provider's API that a payment actually completed.
export const pendingCheckouts = pgTable("pending_checkouts", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  courseSlug: text("course_slug").notNull(),
  courseTitle: text("course_title").notNull(),
  plan: text("plan").notNull(), // "cert" | "course" | "bundle"
  route: text("route"), // "exam" | "attest" | null
  name: text("name").notNull(),
  email: text("email").notNull(),
  amountCents: integer("amount_cents").notNull(),
  country: text("country").notNull().default("US"),
  currency: text("currency").notNull().default("USD"),
  paymentProvider: text("payment_provider").notNull().default("whop"),
  paymentReference: text("payment_reference"),
  whopPlanId: text("whop_plan_id"),
  whopCheckoutConfigId: text("whop_checkout_config_id"),
  examScore: integer("exam_score"),
  status: text("status").notNull().default("pending"), // "pending" | "confirmed" | "expired"
  orderId: integer("order_id").references(() => orders.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const examAttempts = pgTable("exam_attempts", {
  id: serial("id").primaryKey(),
  courseSlug: text("course_slug").notNull(),
  score: integer("score").notNull(), // percentage
  passed: boolean("passed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
