import { getGuidanceBucketForRisk } from "./report-guidance";
import type {
  EvaluationReport,
  ReportAccuracyFeedback,
  ReportDecisionOutcome,
  ReportFeedbackCategory,
  RiskItem,
} from "./types";

export const REPORT_DECISION_OUTCOME_META: Record<
  ReportDecisionOutcome,
  { label: string; description: string }
> = {
  went_to_view: {
    label: "后来去看房了",
    description: "告诉系统这份报告至少帮你推进到了实地看房。",
  },
  rented: {
    label: "后来签了这套",
    description: "告诉系统最后还是决定把这套房签下来。",
  },
  signed_elsewhere: {
    label: "后来签了别的房",
    description: "告诉系统这份报告最后把你分流到了别的选择。",
  },
  not_rented: {
    label: "后来没签这套",
    description: "告诉系统最后停在了哪个点上，或者直接放弃了这套。",
  },
  still_looking: {
    label: "还在看",
    description: "这次判断还在帮你继续筛房。",
  },
};

export const REPORT_ACCURACY_FEEDBACK_META: Record<
  ReportAccuracyFeedback,
  { label: string; description: string }
> = {
  helpful: {
    label: "这次判断有帮助",
    description: "告诉系统这次哪些地方讲得准。",
  },
  missed_risk: {
    label: "后来发现有遗漏风险",
    description: "补一条这次没覆盖到的真实坑点。",
  },
  got_burned: {
    label: "后来真的踩坑了",
    description: "告诉系统后续发生了什么，帮下一次判断更准。",
  },
};

export const REPORT_FEEDBACK_CATEGORY_META: Record<
  ReportFeedbackCategory,
  { label: string; description: string }
> = {
  cash_flow: {
    label: "现金流 / 首付",
    description: "房租、押付、中介费或首月现金压力卡住了决定。",
  },
  commute: {
    label: "通勤",
    description: "时间成本、高峰通勤或路线稳定性出了问题。",
  },
  contract: {
    label: "合同 / 主体",
    description: "合同、出租主体、付款或履约条款不够稳。",
  },
  listing_trust: {
    label: "房源可信度",
    description: "页面信息、现场情况或真实性对不上。",
  },
  flatshare: {
    label: "合租边界",
    description: "室友、公共空间或合租规则让推进卡住。",
  },
  space: {
    label: "空间体验",
    description: "采光、噪音、潮湿、隐私或布局本身不过关。",
  },
  other: {
    label: "其他",
    description: "主因不在上面几类里，但值得被记录下来。",
  },
};

export function shouldAskBlockingCategory(
  decisionOutcome?: ReportDecisionOutcome
) {
  return (
    decisionOutcome === "signed_elsewhere" ||
    decisionOutcome === "not_rented" ||
    decisionOutcome === "still_looking"
  );
}

export function shouldAskMissedRiskCategory(
  accuracyFeedback?: ReportAccuracyFeedback
) {
  return (
    accuracyFeedback === "missed_risk" || accuracyFeedback === "got_burned"
  );
}

export function shouldCountBlockingReason(
  decisionOutcome?: ReportDecisionOutcome
) {
  return (
    decisionOutcome === "signed_elsewhere" ||
    decisionOutcome === "not_rented" ||
    decisionOutcome === "still_looking"
  );
}

export function getRiskFeedbackCategory(
  risk: Pick<RiskItem, "source" | "pillar" | "dimension">
): ReportFeedbackCategory {
  if (risk.source === "decision") {
    switch (risk.pillar) {
      case "cash_flow":
        return "cash_flow";
      case "commute":
        return "commute";
      case "contract":
        return "contract";
      case "listing_trust":
        return "listing_trust";
      case "flatshare":
        return "flatshare";
      default:
        return "other";
    }
  }

  if (risk.source === "space") {
    return "space";
  }

  if (
    ["lighting", "noise", "dampness", "privacy", "circulation", "focus"].includes(
      risk.dimension
    )
  ) {
    return "space";
  }

  return "other";
}

export function getReportFeedbackCategoryBuckets(
  report: Pick<EvaluationReport, "risks">
) {
  const hardStopCategories = new Set<ReportFeedbackCategory>();
  const negotiableCategories = new Set<ReportFeedbackCategory>();
  const verifyCategories = new Set<ReportFeedbackCategory>();

  for (const risk of report.risks) {
    const bucket = getGuidanceBucketForRisk(risk);
    const category = getRiskFeedbackCategory(risk);

    if (bucket === "hard_stop") {
      hardStopCategories.add(category);
      continue;
    }

    if (bucket === "negotiable") {
      negotiableCategories.add(category);
      continue;
    }

    verifyCategories.add(category);
  }

  return {
    hardStopCategories: Array.from(hardStopCategories),
    negotiableCategories: Array.from(negotiableCategories),
    verifyCategories: Array.from(verifyCategories),
  };
}
