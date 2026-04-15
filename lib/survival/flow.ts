import type { RoutePlan, RouteWizardInput } from "../types/survival-sandbox";

export const ROUTE_WIZARD_REQUIRED_FIELDS_ERROR =
  "先把出发城市、毕业时间和预算补齐，路线图才能排得稳。";

export function canGenerateRoutePlan(input: RouteWizardInput) {
  return Boolean(input.originCity.trim() && input.graduationDate && input.housingBudget.trim());
}

export function getRouteWizardValidationError(input: RouteWizardInput) {
  return canGenerateRoutePlan(input) ? "" : ROUTE_WIZARD_REQUIRED_FIELDS_ERROR;
}

export function resolveRoutePlanLoad({
  localPlan,
  remotePlan,
}: {
  localPlan: RoutePlan | null;
  remotePlan: RoutePlan | null;
}) {
  if (remotePlan && localPlan) {
    return {
      state: "ready" as const,
      sourceMode: "hybrid" as const,
      plan: remotePlan,
      shouldPersistRemotePlan: true,
    };
  }

  if (remotePlan) {
    return {
      state: "ready" as const,
      sourceMode: "remote" as const,
      plan: remotePlan,
      shouldPersistRemotePlan: true,
    };
  }

  if (localPlan) {
    return {
      state: "ready" as const,
      sourceMode: "local" as const,
      plan: localPlan,
      shouldPersistRemotePlan: false,
    };
  }

  return {
    state: "missing" as const,
    sourceMode: "local" as const,
    plan: null,
    shouldPersistRemotePlan: false,
  };
}
