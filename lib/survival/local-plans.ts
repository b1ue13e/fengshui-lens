import type { RoutePlan } from "../types/survival-sandbox";

export const LOCAL_ROUTE_PLANS_STORAGE_KEY = "young-study_survival_route_plans";
export const LOCAL_ROUTE_PLAN_DRAFT_KEY = "young-study_survival_route_plan_draft";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParse<T>(raw: string | null, fallback: T) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readLocalRoutePlans() {
  if (!canUseStorage()) {
    return [] as RoutePlan[];
  }

  return safeParse<RoutePlan[]>(
    window.localStorage.getItem(LOCAL_ROUTE_PLANS_STORAGE_KEY),
    []
  );
}

export function getLocalRoutePlan(planId: string) {
  return readLocalRoutePlans().find((plan) => plan.id === planId) ?? null;
}

export function saveLocalRoutePlan(plan: RoutePlan) {
  if (!canUseStorage()) {
    return;
  }

  const nextPlans = [plan, ...readLocalRoutePlans().filter((item) => item.id !== plan.id)].slice(0, 12);
  window.localStorage.setItem(LOCAL_ROUTE_PLANS_STORAGE_KEY, JSON.stringify(nextPlans));
}

export function saveRoutePlanDraft(input: Record<string, unknown>) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_ROUTE_PLAN_DRAFT_KEY, JSON.stringify(input));
}

export function readRoutePlanDraft<T extends object>(fallback: T) {
  if (!canUseStorage()) {
    return fallback;
  }

  return safeParse<T>(window.localStorage.getItem(LOCAL_ROUTE_PLAN_DRAFT_KEY), fallback);
}

export function clearRoutePlanDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(LOCAL_ROUTE_PLAN_DRAFT_KEY);
}
