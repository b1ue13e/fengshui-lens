import { describe, expect, it } from "vitest";

import {
  ROUTE_WIZARD_REQUIRED_FIELDS_ERROR,
  canGenerateRoutePlan,
  getRouteWizardValidationError,
  resolveRoutePlanLoad,
} from "../flow";
import type { RoutePlan, RouteWizardInput } from "../../types/survival-sandbox";

const baseInput: RouteWizardInput = {
  targetCity: "shanghai",
  originCity: "合肥",
  graduationDate: "2026-06-30",
  offerStatus: "signed_offer",
  arrivalWindow: "this_month",
  housingBudget: "4000",
  hukouInterest: "maybe",
  currentHousingStatus: "campus",
};

const samplePlan: RoutePlan = {
  id: "plan-flow",
  city: "shanghai",
  persona: "fresh_graduate",
  generatedAt: "2026-04-15T00:00:00.000Z",
  knowledgeVersion: "test",
  input: baseInput,
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

describe("survival flow helpers", () => {
  it("gates route generation on the required wizard fields", () => {
    expect(canGenerateRoutePlan(baseInput)).toBe(true);
    expect(
      canGenerateRoutePlan({
        ...baseInput,
        originCity: "",
      })
    ).toBe(false);
    expect(
      getRouteWizardValidationError({
        ...baseInput,
        housingBudget: "",
      })
    ).toBe(ROUTE_WIZARD_REQUIRED_FIELDS_ERROR);
  });

  it("keeps guest reopen in local mode when only the local plan exists", () => {
    const resolved = resolveRoutePlanLoad({
      localPlan: samplePlan,
      remotePlan: null,
    });

    expect(resolved).toEqual({
      state: "ready",
      sourceMode: "local",
      plan: samplePlan,
      shouldPersistRemotePlan: false,
    });
  });

  it("upgrades to remote or hybrid mode when a synced plan is available", () => {
    const remoteOnly = resolveRoutePlanLoad({
      localPlan: null,
      remotePlan: samplePlan,
    });
    const hybrid = resolveRoutePlanLoad({
      localPlan: {
        ...samplePlan,
        id: "plan-flow-local",
      },
      remotePlan: samplePlan,
    });

    expect(remoteOnly.sourceMode).toBe("remote");
    expect(remoteOnly.shouldPersistRemotePlan).toBe(true);
    expect(hybrid.sourceMode).toBe("hybrid");
    expect(hybrid.plan).toBe(samplePlan);
    expect(hybrid.shouldPersistRemotePlan).toBe(true);
  });

  it("returns a missing state when neither local nor remote plans exist", () => {
    expect(
      resolveRoutePlanLoad({
        localPlan: null,
        remotePlan: null,
      })
    ).toEqual({
      state: "missing",
      sourceMode: "local",
      plan: null,
      shouldPersistRemotePlan: false,
    });
  });
});
