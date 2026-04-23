import {
  DECISION_PILLAR_LABELS,
  DIMENSION_LABELS,
} from "./constants/evaluation";
import { buildPortableShareSummary } from "./report-guidance";
import type {
  DecisionPillarAssessment,
  EngineResult,
  EvaluationReport,
} from "./types";

const verdictHeadlineMap: Record<EngineResult["verdict"], string> = {
  rent: "可以继续推进，但别跳过关键核实。",
  cautious: "先别急着签，谨慎推进，先把关键证据补齐。",
  avoid: "先停在这里，把时间留给下一套更划算。",
};

function getWeakestDimension(result: EngineResult) {
  return [...result.dimensions].sort((a, b) => a.score - b.score)[0];
}

function getTopDecisionPillar(pillars: DecisionPillarAssessment[] = []) {
  return [...pillars].sort((a, b) => a.score - b.score)[0];
}

export interface DecisionSnapshot {
  headline: string;
  topEvidence: string[];
  nextAction: string;
  shareText: string;
}

export function buildDecisionSnapshot(engineResult: EngineResult): DecisionSnapshot {
  const topRisk = engineResult.risks[0];
  const topPillar = getTopDecisionPillar(engineResult.decisionPillars);
  const weakestDimension = getWeakestDimension(engineResult);

  const nextAction =
    topPillar?.nextStep ??
    engineResult.actions[0]?.title ??
    (topRisk
      ? `先围绕「${topRisk.title}」把证据补齐，再决定要不要继续推进。`
      : "把这份判断成果带去现场继续核实。");

  const topEvidence = [
    topPillar
      ? `当前最拖后腿的是「${DECISION_PILLAR_LABELS[topPillar.pillar]}」：${topPillar.headline}`
      : null,
    topRisk ? `最该优先处理的是「${topRisk.title}」` : null,
    weakestDimension
      ? `空间辅助项里最弱的是「${DIMENSION_LABELS[weakestDimension.dimension]}」`
      : null,
  ].filter((item): item is string => Boolean(item));

  return {
    headline: verdictHeadlineMap[engineResult.verdict],
    topEvidence: topEvidence.slice(0, 3),
    nextAction,
    shareText: buildPortableShareSummary(engineResult),
  };
}

export function getDecisionSnapshot(report: EvaluationReport) {
  return report.decisionSnapshot;
}
