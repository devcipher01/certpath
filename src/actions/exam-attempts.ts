import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/server/db";
import { examAttempts } from "@/server/schema";

const recordSchema = z.object({
  courseSlug: z.string().min(1),
  score: z.number().int().min(0).max(100),
  passed: z.boolean(),
});

// Lightweight audit log of every exam attempt, pass or fail — useful later
// for course analytics (pass rates, question difficulty) without needing
// a schema change.
export const recordExamAttempt = createServerFn({ method: "POST" })
  .validator((data: unknown) => recordSchema.parse(data))
  .handler(async ({ data }) => {
    await db.insert(examAttempts).values(data);
    return { ok: true as const };
  });
