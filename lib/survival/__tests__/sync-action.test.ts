import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoutePlan } from "../../types/survival-sandbox";

const { syncRemoteRoutePlans } = vi.hoisted(() => ({
  syncRemoteRoutePlans: vi.fn(),
}));

vi.mock("../../supabase/server", () => ({
  getServerSupabaseClient: vi.fn(async () => null),
}));

vi.mock("../../repositories/progress-repository", () => ({
  createEmptyProgressSnapshot: vi.fn(() => ({
    favorites: [],
    completed: [],
    recent: [],
    savedToolkits: [],
    checklistState: {},
  })),
  mergeProgressSnapshots: vi.fn(),
  progressRepository: {
    saveRemoteProgress: vi.fn(),
    getRemoteProgress: vi.fn(),
    submitFeedback: vi.fn(),
  },
}));

vi.mock("../route-plan-repository", () => ({
  routePlanRepository: {
    syncRemoteRoutePlans,
  },
}));

import { syncLocalRoutePlansAfterLogin } from "../../../app/actions/young-study";

const samplePlan: RoutePlan = {
  id: "plan-sync",
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

describe("syncLocalRoutePlansAfterLogin", () => {
  beforeEach(() => {
    syncRemoteRoutePlans.mockReset();
  });

  it("short-circuits when there are no local route plans to sync", async () => {
    const result = await syncLocalRoutePlansAfterLogin([]);

    expect(result).toEqual({ ok: true, mode: "no-local-plans", count: 0 });
    expect(syncRemoteRoutePlans).not.toHaveBeenCalled();
  });

  it("delegates to the route plan repository after login", async () => {
    syncRemoteRoutePlans.mockResolvedValue({ ok: true, count: 1 });

    const result = await syncLocalRoutePlansAfterLogin([samplePlan]);

    expect(syncRemoteRoutePlans).toHaveBeenCalledWith([samplePlan]);
    expect(result).toEqual({ ok: true, mode: "supabase", count: 1 });
  });
});
