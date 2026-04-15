import { getServerSupabaseClient } from "../supabase/server";
import type { RoutePlan } from "../types/survival-sandbox";

async function resolveCurrentUserId() {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return { supabase: null, userId: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    userId: user?.id ?? null,
  };
}

function mapRowToPlan(row: Record<string, unknown>) {
  return row.plan_json as RoutePlan;
}

export const routePlanRepository = {
  async saveRemoteRoutePlan(plan: RoutePlan) {
    const { supabase, userId } = await resolveCurrentUserId();

    if (!supabase || !userId) {
      return { ok: false, reason: "missing-session" } as const;
    }

    const { error } = await supabase.from("route_plans").upsert(
      {
        id: plan.id,
        user_id: userId,
        target_city: plan.city,
        persona: plan.persona,
        knowledge_version: plan.knowledgeVersion,
        input_json: plan.input,
        plan_json: plan,
      },
      { onConflict: "id" }
    );

    if (error) {
      return { ok: false, reason: error.message } as const;
    }

    return { ok: true } as const;
  },

  async getRemoteRoutePlanById(planId: string) {
    const { supabase, userId } = await resolveCurrentUserId();

    if (!supabase || !userId) {
      return null;
    }

    const { data, error } = await supabase
      .from("route_plans")
      .select("plan_json")
      .eq("id", planId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapRowToPlan(data as Record<string, unknown>);
  },

  async syncRemoteRoutePlans(plans: RoutePlan[]) {
    const { supabase, userId } = await resolveCurrentUserId();

    if (!supabase || !userId || !plans.length) {
      return { ok: false, reason: "missing-session" } as const;
    }

    const rows = plans.map((plan) => ({
      id: plan.id,
      user_id: userId,
      target_city: plan.city,
      persona: plan.persona,
      knowledge_version: plan.knowledgeVersion,
      input_json: plan.input,
      plan_json: plan,
    }));

    const { error } = await supabase.from("route_plans").upsert(rows, { onConflict: "id" });

    if (error) {
      return { ok: false, reason: error.message } as const;
    }

    return { ok: true, count: rows.length } as const;
  },
};
