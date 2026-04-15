import { describe, expect, it } from "vitest";

import { POST } from "../../../app/api/survival-plans/route";

describe("POST /api/survival-plans", () => {
  it("creates a cited Shanghai route plan for supported fresh graduates", async () => {
    const response = await POST(
      new Request("http://localhost/api/survival-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetCity: "shanghai",
          originCity: "合肥",
          graduationDate: "2026-06-30",
          offerStatus: "signed_offer",
          arrivalWindow: "within_2_weeks",
          housingBudget: "3500-4500",
          hukouInterest: "strong_yes",
          currentHousingStatus: "campus",
        }),
      })
    );

    const payload = (await response.json()) as {
      planId: string;
      savedRemote: boolean;
      plan: {
        id: string;
        city: string;
        fallbackUsed: boolean;
        stages: Array<{ id: string; steps: Array<{ citations: unknown[] }> }>;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.planId).toBeTruthy();
    expect(payload.plan.id).toBe(payload.planId);
    expect(payload.plan.city).toBe("shanghai");
    expect(payload.plan.fallbackUsed).toBe(false);
    expect(payload.savedRemote).toBe(false);
    expect(payload.plan.stages).toHaveLength(8);
    expect(
      payload.plan.stages.some((stage) =>
        stage.steps.some((step) => step.citations.length > 0)
      )
    ).toBe(true);
  });

  it("falls back clearly when the requested city is outside the Shanghai sample", async () => {
    const response = await POST(
      new Request("http://localhost/api/survival-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetCity: "beijing",
          originCity: "合肥",
          graduationDate: "2026-06-30",
          offerStatus: "no_offer",
          arrivalWindow: "this_month",
          housingBudget: "3500-4500",
          hukouInterest: "maybe",
          currentHousingStatus: "campus",
        }),
      })
    );

    const payload = (await response.json()) as {
      plan: {
        city: string;
        fallbackUsed: boolean;
        supportingSources: unknown[];
        stages: Array<{ steps: Array<{ verificationRequired: boolean }> }>;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.plan.city).toBe("beijing");
    expect(payload.plan.fallbackUsed).toBe(true);
    expect(payload.plan.supportingSources).toHaveLength(0);
    expect(
      payload.plan.stages.every((stage) =>
        stage.steps.every((step) => step.verificationRequired)
      )
    ).toBe(true);
  });

  it("rejects invalid wizard payloads with a 400 response", async () => {
    const response = await POST(
      new Request("http://localhost/api/survival-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetCity: "shanghai",
          originCity: "",
          graduationDate: "2026-06-30",
          offerStatus: "signed_offer",
          arrivalWindow: "within_2_weeks",
          housingBudget: "",
          hukouInterest: "strong_yes",
          currentHousingStatus: "campus",
        }),
      })
    );

    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBeTruthy();
  });
});
