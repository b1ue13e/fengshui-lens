import type { Dimension, EvaluationReport, PrimaryGoal } from "./types";

const verdictRank: Record<EvaluationReport["verdict"], number> = {
  rent: 3,
  cautious: 2,
  avoid: 1,
};

export function goalWeights(goal: PrimaryGoal): Record<Dimension, number> {
  switch (goal) {
    case "sleep_quality":
      return { lighting: 0.9, noise: 1.3, dampness: 1.0, privacy: 1.1, circulation: 0.8, focus: 0.7 };
    case "wfh":
      return { lighting: 1.1, noise: 1.2, dampness: 0.9, privacy: 1.0, circulation: 0.9, focus: 1.3 };
    case "exam_prep":
      return { lighting: 1.0, noise: 1.3, dampness: 0.9, privacy: 1.1, circulation: 0.8, focus: 1.2 };
    case "couple":
      return { lighting: 1.0, noise: 1.0, dampness: 1.0, privacy: 1.2, circulation: 1.0, focus: 0.8 };
    case "elderly_safety":
      return { lighting: 1.0, noise: 0.9, dampness: 1.2, privacy: 0.9, circulation: 1.3, focus: 0.7 };
  }
}

export function getGoalMatchScore(report: EvaluationReport) {
  const weights = goalWeights(report.input.primaryGoal);
  const total = report.dimensions.reduce((sum, item) => sum + item.score * weights[item.dimension], 0);
  const weightSum = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return Math.round(total / weightSum);
}

export function getRecommendation(left: EvaluationReport, right: EvaluationReport) {
  const leftGoalScore = getGoalMatchScore(left);
  const rightGoalScore = getGoalMatchScore(right);

  if (verdictRank[left.verdict] !== verdictRank[right.verdict]) {
    return verdictRank[left.verdict] > verdictRank[right.verdict]
      ? { winner: "left" as const, reason: "整体结论更稳，先推进左侧这套更省时间。" }
      : { winner: "right" as const, reason: "整体结论更稳，先推进右侧这套更省时间。" };
  }

  if (Math.abs(leftGoalScore - rightGoalScore) >= 6) {
    return leftGoalScore > rightGoalScore
      ? { winner: "left" as const, reason: "它和你的居住目标更匹配，后续妥协更少。" }
      : { winner: "right" as const, reason: "它和你的居住目标更匹配，后续妥协更少。" };
  }

  if (Math.abs(left.overallScore - right.overallScore) >= 5) {
    return left.overallScore > right.overallScore
      ? { winner: "left" as const, reason: "六维总分更稳，综合性价比更高。" }
      : { winner: "right" as const, reason: "六维总分更稳，综合性价比更高。" };
  }

  return {
    winner: null,
    reason: "两套房差距不大，建议按报告里的首要风险去现场复核后再定。",
  };
}

export function buildCompareActionPlan({
  left,
  right,
  recommendation,
}: {
  left: EvaluationReport;
  right: EvaluationReport;
  recommendation: ReturnType<typeof getRecommendation>;
}) {
  const winner =
    recommendation.winner === "left"
      ? left
      : recommendation.winner === "right"
        ? right
        : null;
  const loser =
    recommendation.winner === "left"
      ? right
      : recommendation.winner === "right"
        ? left
        : null;

  if (!winner || !loser) {
    return {
      headline: "先别急着选赢面，先把关键证据补齐",
      winnerAction: "把两边都带着首要风险去现场复核，再回 compare 拍板。",
      loserAction: "还不要急着淘汰任何一套，先看谁的关键证据补起来更顺。",
      questions: [
        left.decisionSnapshot.nextAction,
        right.decisionSnapshot.nextAction,
      ].filter(Boolean).slice(0, 2),
    };
  }

  return {
    headline:
      recommendation.winner === "left"
        ? "左侧先继续推进，右侧先降级处理"
        : "右侧先继续推进，左侧先降级处理",
    winnerAction:
      winner.verdict === "rent"
        ? "先把赢面更高的这套带去现场、合同和付款条件复核，不要分散精力。"
        : "虽然这套暂时赢了，但也只是相对更稳，先补齐证据再决定要不要继续投入。",
    loserAction:
      loser.verdict === "avoid"
        ? "输的这套可以直接退出当前决策带宽，别再为它花额外时间。"
        : "输的这套先别删，留作 compare 备选；只有当赢的那套谈崩时再回来补看。",
    questions: [
      winner.risks[0]?.title
        ? `继续推进前先核：${winner.risks[0].title}`
        : winner.decisionSnapshot.nextAction,
      loser.risks[0]?.title
        ? `如果回看落选项，重点盯：${loser.risks[0].title}`
        : loser.decisionSnapshot.nextAction,
    ].filter(Boolean).slice(0, 2),
  };
}
