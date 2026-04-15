import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoutePlan } from "../../types/survival-sandbox";

const { getServerSupabaseClient } = vi.hoisted(() => ({
  getServerSupabaseClient: vi.fn(),
}));

vi.mock("../../supabase/server", () => ({
  getServerSupabaseClient,
}));

import { routePlanRepository } from "../route-plan-repository";

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

function createAuthedSupabase() {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const maybeSingle = vi.fn().mockResolvedValue({
    data: { plan_json: samplePlan },
    error: null,
  });
  const eqByUser = vi.fn().mockReturnValue({
    maybeSingle,
  });
  const eqById = vi.fn().mockReturnValue({
    eq: eqByUser,
  });
  const select = vi.fn().mockReturnValue({
    eq: eqById,
  });
  const from = vi.fn((table: string) => {
    if (table !== "route_plans") {
      throw new Error(`unexpected table: ${table}`);
    }

    return {
      upsert,
      select,
    };
  });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: "user-123" },
        },
      }),
    },
    from,
    spies: {
      upsert,
      maybeSingle,
      eqById,
      eqByUser,
      select,
    },
  };
}

describe("routePlanRepository", () => {
  beforeEach(() => {
    getServerSupabaseClient.mockReset();
  });

  it("returns missing-session when a guest tries to save a remote route plan", async () => {
    getServerSupabaseClient.mockResolvedValue(null);

    const result = await routePlanRepository.saveRemoteRoutePlan(samplePlan);

    expect(result).toEqual({ ok: false, reason: "missing-session" });
  });

  it("persists a generated route plan under the authenticated user", async () => {
    const supabase = createAuthedSupabase();
    getServerSupabaseClient.mockResolvedValue(supabase);

    const result = await routePlanRepository.saveRemoteRoutePlan(samplePlan);

    expect(supabase.from).toHaveBeenCalledWith("route_plans");
    expect(supabase.spies.upsert).toHaveBeenCalledWith(
      {
        id: samplePlan.id,
        user_id: "user-123",
        target_city: samplePlan.city,
        persona: samplePlan.persona,
        knowledge_version: samplePlan.knowledgeVersion,
        input_json: samplePlan.input,
        plan_json: samplePlan,
      },
      { onConflict: "id" }
    );
    expect(result).toEqual({ ok: true });
  });

  it("only reads remote route plans for the current authenticated user", async () => {
    const supabase = createAuthedSupabase();
    getServerSupabaseClient.mockResolvedValue(supabase);

    const result = await routePlanRepository.getRemoteRoutePlanById("plan-remote");

    expect(supabase.from).toHaveBeenCalledWith("route_plans");
    expect(supabase.spies.select).toHaveBeenCalledWith("plan_json");
    expect(supabase.spies.eqById).toHaveBeenCalledWith("id", "plan-remote");
    expect(supabase.spies.eqByUser).toHaveBeenCalledWith("user_id", "user-123");
    expect(result).toEqual(samplePlan);
  });

  it("syncs multiple local route plans into the authenticated cloud account", async () => {
    const supabase = createAuthedSupabase();
    getServerSupabaseClient.mockResolvedValue(supabase);

    const anotherPlan: RoutePlan = {
      ...samplePlan,
      id: "plan-remote-2",
      generatedAt: "2026-04-16T00:00:00.000Z",
    };

    const result = await routePlanRepository.syncRemoteRoutePlans([
      samplePlan,
      anotherPlan,
    ]);

    expect(supabase.spies.upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: samplePlan.id,
          user_id: "user-123",
          plan_json: samplePlan,
        }),
        expect.objectContaining({
          id: anotherPlan.id,
          user_id: "user-123",
          plan_json: anotherPlan,
        }),
      ],
      { onConflict: "id" }
    );
    expect(result).toEqual({ ok: true, count: 2 });
  });
});
