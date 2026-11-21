import { z } from "./schema.ts";
import {
  activitySchema,
  privacyRiskSchema,
  findingSchema,
  taskSchema,
} from "./model.ts";
const text = z.string().max(8000),
  short = z.string().max(240),
  rating = z.number().int().min(1).max(5);
const ids = z.array(short).max(100);
const config = z
  .object({
    threshold: z.number().min(0).max(1),
    prevalence: z.number().min(1).max(80),
    shift: z.number().min(0).max(10),
    features: z.number().int().min(1).max(12),
    split: z.enum(["training", "holdout"]),
    seed: z.number().int().min(0).max(2147483647),
  })
  .strict();
const metric = z
  .object({
    tp: z.number().int().min(0).max(400),
    fp: z.number().int().min(0).max(400),
    tn: z.number().int().min(0).max(400),
    fn: z.number().int().min(0).max(400),
    precision: z.number().min(0).max(1),
    recall: z.number().min(0).max(1),
    f1: z.number().min(0).max(1),
    fpr: z.number().min(0).max(1),
  })
  .strict();
// Drafts may be incomplete, but imports must preserve the shape and bounds
// expected by each editor. Unknown lab keys are rejected rather than cast.
export const draftsSchema = z
  .object({
    "guided-assessment": z
      .object({ step: z.number().int().min(0).max(3), draft: findingSchema })
      .partial()
      .strict(),
    "nist-implementation": z.object({ selected: short }).partial().strict(),
    privacy: z
      .object({
        activity: activitySchema,
        risk: privacyRiskSchema,
        selectedActivity: short,
        tolerance: z.number().min(1).max(25),
      })
      .partial()
      .strict(),
    implementation: z
      .object({
        draft: taskSchema.nullable(),
        holidays: text,
        raid: z
          .object({
            type: z.enum(["Risk", "Assumption", "Issue", "Dependency"]),
            description: text,
            owner: short,
            action: text,
          })
          .strict(),
      })
      .partial()
      .strict(),
    ai: z
      .object({
        config,
        experiment: z.number().int().min(0).max(9),
        comparison: z
          .array(z.object({ config, result: metric }).strict())
          .max(4),
        message: text,
      })
      .partial()
      .strict(),
    incident: z
      .object({
        filter: text,
        marked: ids,
        hypothesis: short,
        classification: short,
        severity: short,
        notes: text,
        actions: z
          .array(
            z
              .object({
                id: short,
                label: text,
                required: z.number().int().min(0).max(20),
                feedback: text,
                disruption: short,
                premature: z.boolean(),
                message: text,
              })
              .strict(),
          )
          .max(100),
        reviewed: z.boolean(),
      })
      .partial()
      .strict(),
    boardroom: z
      .object({
        budget: z.number().min(0).max(10000000),
        situation: z.number().int().min(0).max(2),
        selected: ids,
        owner: short,
        strategy: text,
        assurance: text,
        decision: text,
        brief: text,
        evaluated: z.boolean(),
      })
      .partial()
      .strict(),
    "risk-decision": z
      .object({
        comparisons: z
          .array(
            z
              .object({
                label: short,
                inherent: z.number().min(0).max(25),
                residual: z.number().min(0).max(25),
                treatment: short,
                assumptions: text,
              })
              .strict(),
          )
          .max(10),
        riskId: short,
        statement: text,
        likelihood: rating,
        impact: rating,
        residualL: rating,
        residualI: rating,
        method: z.enum(["product", "maximum"]),
        expert: z.boolean(),
        selected: ids,
        evidence: text,
        treatment: short,
        reason: text,
        owner: short,
        review: text,
        evaluated: z.boolean(),
      })
      .partial()
      .strict(),
  })
  .partial()
  .strict();
