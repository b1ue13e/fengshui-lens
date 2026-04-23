import { Evaluation } from "@prisma/client";

import { buildDecisionSnapshot } from "../rent-tools/decision-snapshot";
import {
  assessDecisionPillars,
} from "../rent-tools/decision-pillars";
import {
  Dimension,
  DimensionScore,
  EvaluationInput,
  EvaluationReport,
} from "../rent-tools/types";
import { isVerdict } from "../rent-tools/constants/evaluation";

interface RawEvaluation extends Evaluation {
  [key: string]: unknown;
}

function parseScores(db: RawEvaluation): Record<Dimension, number> {
  return {
    lighting: clampScore(db.scoreLighting),
    noise: clampScore(db.scoreNoise),
    dampness: clampScore(db.scoreDampness),
    privacy: clampScore(db.scorePrivacy),
    circulation: clampScore(db.scoreCirculation),
    focus: clampScore(db.scoreFocus),
  };
}

function clampScore(score: unknown): number {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return 70;
  }

  return Math.max(0, Math.min(100, score));
}

function buildDimensions(scores: Record<Dimension, number>): DimensionScore[] {
  const dimensions: Dimension[] = [
    "lighting",
    "noise",
    "dampness",
    "privacy",
    "circulation",
    "focus",
  ];

  return dimensions.map((dimension) => ({
    dimension,
    score: scores[dimension],
    weight: 1,
    factors: [],
  }));
}

function safeParse<T>(json: string | null, defaultValue: T): T {
  if (!json) {
    return defaultValue;
  }

  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

function validateVerdict(verdict: unknown): "rent" | "cautious" | "avoid" {
  if (typeof verdict === "string" && isVerdict(verdict)) {
    return verdict;
  }

  if (verdict === "RENT") {
    return "rent";
  }

  if (verdict === "CAUTIOUS") {
    return "cautious";
  }

  if (verdict === "AVOID") {
    return "avoid";
  }

  return "cautious";
}

function buildInput(db: RawEvaluation): EvaluationInput {
  return {
    layoutType: String(db.layoutType) as EvaluationInput["layoutType"],
    areaSqm: Number(db.areaSqm) || 0,
    orientation: String(db.orientation) as EvaluationInput["orientation"],
    floorLevel: String(db.floorLevel) as EvaluationInput["floorLevel"],
    totalFloors: Number(db.totalFloors) || 0,
    hasElevator: Boolean(db.hasElevator),
    buildingAge: String(db.buildingAge) as EvaluationInput["buildingAge"],
    hasWestFacingWindow: Boolean(db.hasWestFacingWindow),
    windowExposure: String(db.windowExposure) as EvaluationInput["windowExposure"],
    facesMainRoad: Boolean(db.facesMainRoad),
    nearElevator: Boolean(db.nearElevator),
    unitPosition: String(db.unitPosition) as EvaluationInput["unitPosition"],
    hasBalcony: Boolean(db.hasBalcony),
    kitchenType: String(db.kitchenType) as EvaluationInput["kitchenType"],
    bathroomPosition: String(db.bathroomPosition) as EvaluationInput["bathroomPosition"],
    bedPosition: String(db.bedPosition) as EvaluationInput["bedPosition"],
    deskPosition: String(db.deskPosition) as EvaluationInput["deskPosition"],
    ventilation: String(db.ventilation) as EvaluationInput["ventilation"],
    dampSigns: safeParse(db.dampSigns as string, []),
    isShared: Boolean(db.isShared),
    roommateSituation:
      typeof db.roommateSituation === "string" ? db.roommateSituation : undefined,
    primaryGoal: String(db.primaryGoal) as EvaluationInput["primaryGoal"],
    monthlyBudget: String(db.monthlyBudget) as EvaluationInput["monthlyBudget"],
    commuteMinutes: typeof db.commuteMinutes === "number" ? db.commuteMinutes : undefined,
    commuteTolerance:
      typeof db.commuteTolerance === "string"
        ? (db.commuteTolerance as EvaluationInput["commuteTolerance"])
        : undefined,
    monthlyRent: typeof db.monthlyRent === "number" ? db.monthlyRent : undefined,
    estimatedMonthlyBills:
      typeof db.estimatedMonthlyBills === "number" ? db.estimatedMonthlyBills : undefined,
    depositMonths: typeof db.depositMonths === "number" ? db.depositMonths : undefined,
    paymentCycle:
      typeof db.paymentCycle === "string"
        ? (db.paymentCycle as EvaluationInput["paymentCycle"])
        : undefined,
    agentFeeMonths: typeof db.agentFeeMonths === "number" ? db.agentFeeMonths : undefined,
    landlordType:
      typeof db.landlordType === "string"
        ? (db.landlordType as EvaluationInput["landlordType"])
        : undefined,
    contractVisibility:
      typeof db.contractVisibility === "string"
        ? (db.contractVisibility as EvaluationInput["contractVisibility"])
        : undefined,
    listingMatchLevel:
      typeof db.listingMatchLevel === "string"
        ? (db.listingMatchLevel as EvaluationInput["listingMatchLevel"])
        : undefined,
    sharedSpaceRules:
      typeof db.sharedSpaceRules === "string"
        ? (db.sharedSpaceRules as EvaluationInput["sharedSpaceRules"])
        : undefined,
    allowsLightRenovation: Boolean(db.allowsLightRenovation),
    allowsFurnitureMove: Boolean(db.allowsFurnitureMove),
    allowsSoftImprovements: Boolean(db.allowsSoftImprovements),
  };
}

export function toEvaluationReport(db: RawEvaluation): EvaluationReport {
  const scores = parseScores(db);
  const dimensions = buildDimensions(scores);
  const input = buildInput(db);
  const risks = safeParse(db.detectedRisks as string, []);
  const actions = safeParse(db.recommendedActions as string, []);
  const chatScripts = safeParse(db.chatScripts as string, []);
  const verdict = validateVerdict(db.verdict);
  const overallScore = clampScore(db.scoreOverall);
  const spaceScore = overallScore;
  const decisionPillars = assessDecisionPillars(input, scores);
  const decisionSnapshot = buildDecisionSnapshot({
    scores,
    spaceScore,
    overallScore,
    dimensions,
    decisionPillars,
    risks,
    actions,
    verdict,
  });

  return {
    id: db.id,
    createdAt: db.createdAt,
    input,
    scores,
    spaceScore,
    overallScore,
    dimensions,
    decisionPillars,
    risks,
    actions,
    verdict,
    summaryText: db.summaryText || "",
    chatScripts,
    decisionSnapshot,
  };
}

export function toEvaluationReports(dbs: RawEvaluation[]): EvaluationReport[] {
  return dbs.map(toEvaluationReport);
}
