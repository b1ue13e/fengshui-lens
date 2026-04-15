import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LOCAL_ROUTE_PLAN_DRAFT_KEY,
  LOCAL_ROUTE_PLANS_STORAGE_KEY,
  getLocalRoutePlan,
  readRoutePlanDraft,
  readLocalRoutePlans,
  saveLocalRoutePlan,
  saveRoutePlanDraft,
} from "../local-plans";
import type { RoutePlan } from "../../types/survival-sandbox";

function createStorage() {
  const store = new Map<string, string>();

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

const samplePlan: RoutePlan = {
  id: "plan-local",
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

describe("local route plan storage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists generated plans for guest reopen", () => {
    saveLocalRoutePlan(samplePlan);

    expect(readLocalRoutePlans()).toHaveLength(1);
    expect(getLocalRoutePlan("plan-local")?.summary.headline).toBe("headline");
  });

  it("persists wizard draft state", () => {
    saveRoutePlanDraft({ originCity: "合肥" });

    expect(readRoutePlanDraft({})).toEqual({ originCity: "合肥" });
    expect(window.localStorage.getItem(LOCAL_ROUTE_PLAN_DRAFT_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(LOCAL_ROUTE_PLANS_STORAGE_KEY)).toBeNull();
  });
});
