import { describe, expect, it } from "vitest";

import { survivalKnowledgeBase } from "../../content/survival-sandbox";
import { createRoutePlan } from "../planner";
import type { SurvivalKnowledgeBase } from "../../types/survival-sandbox";

const input = {
  targetCity: "shanghai",
  originCity: "合肥",
  graduationDate: "2026-06-30",
  offerStatus: "signed_offer",
  arrivalWindow: "within_2_weeks",
  housingBudget: "3500-4500",
  hukouInterest: "strong_yes",
  currentHousingStatus: "campus",
} as const;

describe("createRoutePlan", () => {
  it("attaches citations to supported policy steps", async () => {
    const plan = await createRoutePlan({
      input,
      knowledgeBase: survivalKnowledgeBase,
      planId: "plan-1",
    });

    const citedSteps = plan.stages.flatMap((stage) => stage.steps).filter((step) => !step.verificationRequired);

    expect(citedSteps.length).toBeGreaterThan(0);
    expect(citedSteps.every((step) => step.citations.length > 0)).toBe(true);
  });

  it("marks fallback steps as verificationRequired when citations are missing", async () => {
    const sparseBase: SurvivalKnowledgeBase = {
      version: "sparse",
      sources: [],
      documents: [],
      chunks: [],
    };

    const plan = await createRoutePlan({
      input,
      knowledgeBase: sparseBase,
      planId: "plan-2",
    });

    expect(plan.stages.every((stage) => stage.steps[0]?.verificationRequired)).toBe(true);
    expect(plan.stages.every((stage) => stage.steps[0]?.citations.length === 0)).toBe(true);
  });
});
