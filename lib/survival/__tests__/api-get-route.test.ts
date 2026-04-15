import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoutePlan } from "../../types/survival-sandbox";

const { getRemoteRoutePlanById } = vi.hoisted(() => ({
  getRemoteRoutePlanById: vi.fn(),
}));

vi.mock("../route-plan-repository", () => ({
  routePlanRepository: {
    getRemoteRoutePlanById,
  },
}));

import { GET } from "../../../app/api/survival-plans/[id]/route";

const samplePlan: RoutePlan = {
  id: "plan-remote",
  city: "shanghai",
  persona: "fresh_graduate",
  generatedAt: "2026-04-15T00:00:00.000Z",
  knowledgeVersion: "test",
  input: {
    targetCity: "shanghai",
    originCity: "合肥",
    graduationDate: "2026-06-30",
    offerStatus: "signed_offer",
    arrivalWindow: "this_month",
    housingBudget: "4000",
    hukouInterest: "maybe",
    currentHousingStatus: "campus",
  },
  summary: {
    headline: "headline",
    deck: "deck",
    currentFocus: "focus",
    caution: "caution",
  },
  stages: [],
  supportingSources: [],
  fallbackUsed: false,
};

describe("GET /api/survival-plans/[id]", () => {
  beforeEach(() => {
    getRemoteRoutePlanById.mockReset();
  });

  it("returns the stored plan when the repository finds one", async () => {
    getRemoteRoutePlanById.mockResolvedValue(samplePlan);

    const response = await GET(new Request("http://localhost/api/survival-plans/plan-remote"), {
      params: Promise.resolve({ id: "plan-remote" }),
    });

    const payload = (await response.json()) as { planId: string; plan: RoutePlan };

    expect(response.status).toBe(200);
    expect(getRemoteRoutePlanById).toHaveBeenCalledWith("plan-remote");
    expect(payload.planId).toBe("plan-remote");
    expect(payload.plan.id).toBe("plan-remote");
  });

  it("returns 404 when the plan does not exist for the current viewer", async () => {
    getRemoteRoutePlanById.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/survival-plans/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    const payload = (await response.json()) as { error: string };

    expect(response.status).toBe(404);
    expect(payload.error).toBe("route plan not found");
  });
});
