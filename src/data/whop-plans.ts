// Maps each price point CertPath sells at to a real Whop plan ID.
// Plans were created once (one product per tier: course / cert / bundle,
// each with a one-time-price plan per distinct price point courses use),
// via the Whop MCP tools. See replit.md for how to add a new price point.
import type { Plan } from "@/server/schema";

const COURSE_PLAN_BY_PRICE: Record<number, string> = {
  9: "plan_FEu6yPTipLEAm",
  12: "plan_jI1NP0Omd4Uqx",
  15: "plan_VRzUD67OHXdH7",
  17: "plan_yBGH9AAIzkogo",
  19: "plan_EAkVu1jIokieY",
};

const CERT_PLAN_BY_PRICE: Record<number, string> = {
  9: "plan_hRILQSZNXPYKe",
  12: "plan_VgAreaOf4S4us",
  14: "plan_LP7XeCnfvDLM7",
  15: "plan_mbSPP6RLPigq4",
};

const BUNDLE_PLAN_BY_PRICE: Record<number, string> = {
  12: "plan_VuuQaZa7rCNeJ",
  15: "plan_6XKPy55CiuLMu",
  17: "plan_hXkdLgMCsZg70",
  19: "plan_3VcjYKbiGyWuU",
};

const TABLES: Record<Plan, Record<number, string>> = {
  course: COURSE_PLAN_BY_PRICE,
  cert: CERT_PLAN_BY_PRICE,
  bundle: BUNDLE_PLAN_BY_PRICE,
};

export function getWhopPlanId(plan: Plan, price: number): string {
  const id = TABLES[plan][price];
  if (!id) {
    throw new Error(`No Whop plan configured for ${plan} at $${price}. Add one via the Whop MCP tools first.`);
  }
  return id;
}
