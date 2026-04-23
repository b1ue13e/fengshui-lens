import type { EvaluationReport } from "./types";
import { BUDGET_RANGE_LABELS } from "./types";

export function buildRoutePlanHrefFromReport(report: EvaluationReport) {
  const params = new URLSearchParams({
    from: "rent-report",
    housingBudget: BUDGET_RANGE_LABELS[report.input.monthlyBudget],
  });

  if (report.verdict !== "avoid") {
    params.set("currentHousingStatus", "already_renting");
  }

  return `/survival-plans/start?${params.toString()}`;
}
