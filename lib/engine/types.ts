// Rental tool core types

import type {
  LayoutType,
  Orientation,
  FloorLevel,
  BuildingAge,
  KitchenType,
  BathroomPosition,
  BedPosition,
  DeskPosition,
  Ventilation,
  PrimaryGoal,
  BudgetRange,
  Dimension,
  Verdict,
  Severity,
  CostLevel,
  Difficulty,
  ChatScenario,
  WindowExposure,
  UnitPosition,
  CommuteTolerance,
  PaymentCycle,
  LandlordType,
  ContractVisibility,
  ListingMatchLevel,
  SharedSpaceRules,
  DecisionPillar,
} from "@/lib/rent-tools/constants/evaluation";

export type {
  LayoutType,
  Orientation,
  FloorLevel,
  BuildingAge,
  KitchenType,
  BathroomPosition,
  BedPosition,
  DeskPosition,
  Ventilation,
  PrimaryGoal,
  BudgetRange,
  Dimension,
  Verdict,
  Severity,
  CostLevel,
  Difficulty,
  ChatScenario,
  WindowExposure,
  UnitPosition,
  CommuteTolerance,
  PaymentCycle,
  LandlordType,
  ContractVisibility,
  ListingMatchLevel,
  SharedSpaceRules,
  DecisionPillar,
};

export const REPORT_DECISION_OUTCOMES = [
  "went_to_view",
  "rented",
  "signed_elsewhere",
  "not_rented",
  "still_looking",
] as const;
export type ReportDecisionOutcome = (typeof REPORT_DECISION_OUTCOMES)[number];

export const REPORT_ACCURACY_FEEDBACK_OPTIONS = [
  "helpful",
  "missed_risk",
  "got_burned",
] as const;
export type ReportAccuracyFeedback =
  (typeof REPORT_ACCURACY_FEEDBACK_OPTIONS)[number];

export const REPORT_FEEDBACK_CATEGORIES = [
  "cash_flow",
  "commute",
  "contract",
  "listing_trust",
  "flatshare",
  "space",
  "other",
] as const;
export type ReportFeedbackCategory =
  (typeof REPORT_FEEDBACK_CATEGORIES)[number];

// ========== 输入类型 ==========
export interface EvaluationInput {
  // Step 1: 基础信息
  layoutType: LayoutType;
  areaSqm: number;
  orientation: Orientation;
  floorLevel: FloorLevel;
  totalFloors: number;
  hasElevator: boolean;
  buildingAge: BuildingAge;

  // Step 2: 空间细节
  hasWestFacingWindow: boolean;
  windowExposure: WindowExposure;
  facesMainRoad: boolean;
  nearElevator: boolean;
  unitPosition: UnitPosition;
  hasBalcony: boolean;
  kitchenType: KitchenType;
  bathroomPosition: BathroomPosition;
  bedPosition: BedPosition;
  deskPosition: DeskPosition;
  ventilation: Ventilation;
  dampSigns?: readonly string[];
  isShared: boolean;
  roommateSituation?: string;

  // Step 3: 决策约束
  primaryGoal: PrimaryGoal;
  monthlyBudget: BudgetRange;
  commuteMinutes?: number;
  commuteTolerance?: CommuteTolerance;
  monthlyRent?: number;
  estimatedMonthlyBills?: number;
  depositMonths?: number;
  paymentCycle?: PaymentCycle;
  agentFeeMonths?: number;
  landlordType?: LandlordType;
  contractVisibility?: ContractVisibility;
  listingMatchLevel?: ListingMatchLevel;
  sharedSpaceRules?: SharedSpaceRules;
  allowsLightRenovation: boolean;
  allowsFurnitureMove: boolean;
  allowsSoftImprovements: boolean;
}

// 标准化后的中间表示（引擎内部使用）
export interface NormalizedInput extends EvaluationInput {
  floorRatio: number;
  isLowFloor: boolean;
  isTopFloor: boolean;
  hasGoodOrientation: boolean;
}

// ========== 评分类型 ==========
export interface ScoreFactor {
  name: string;
  impact: number;
  reason: string;
}

export interface DimensionScore {
  dimension: Dimension;
  score: number;
  weight: number;
  factors: ScoreFactor[];
}

export type DecisionPillarStatus = "solid" | "verify" | "danger";

export interface DecisionPillarAssessment {
  pillar: DecisionPillar;
  label: string;
  score: number;
  status: DecisionPillarStatus;
  headline: string;
  summary: string;
  evidence: string[];
  nextStep: string;
}

// ========== 风险类型 ==========
export interface RiskItem {
  id: string;
  severity: Severity;
  dimension: Dimension;
  title: string;
  description: string;
  modernReason?: string;
  mitigable?: boolean;
  source?: "space" | "decision";
  pillar?: DecisionPillar;
}

// ========== 动作类型 ==========
export interface ActionDefinition {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  costLevel: CostLevel;
  costRange: string;
  difficulty: Difficulty;
  timeRequired: string;
  requirements: {
    needsBuyMaterials: boolean;
    needsFurnitureMove: boolean;
    needsLightRenovation: boolean;
  };
  expectedBenefit: {
    description: string;
    score: number;
  };
  whyPriority?: string;
}

export interface RecommendedAction extends ActionDefinition {
  targetsRisks: string[];
  priorityReason: string;
}

// ========== 话术类型 ==========
export interface ChatScript {
  scenario: ChatScenario;
  title: string;
  content: string;
}

export interface DecisionSnapshot {
  headline: string;
  topEvidence: string[];
  nextAction: string;
  shareText: string;
}

// ========== 引擎结果 ==========
export interface EngineResult {
  scores: Record<Dimension, number>;
  spaceScore?: number;
  overallScore: number;
  dimensions: DimensionScore[];
  decisionPillars?: DecisionPillarAssessment[];
  risks: RiskItem[];
  actions: RecommendedAction[];
  verdict: Verdict;
  decisionNote?: import("./decision-note").DecisionNote;
}

// ========== 完整报告（存储用） ==========
export interface EvaluationReport extends EngineResult {
  id: string;
  createdAt: Date;
  input: EvaluationInput;
  summaryText: string;
  chatScripts: ChatScript[];
  decisionSnapshot: DecisionSnapshot;
}

export interface RentToolReportFeedbackRecord {
  id: string;
  reportId: string;
  userId?: string;
  decisionOutcome?: ReportDecisionOutcome;
  accuracyFeedback?: ReportAccuracyFeedback;
  blockingCategory?: ReportFeedbackCategory;
  missedRiskCategory?: ReportFeedbackCategory;
  note?: string;
  createdAt: Date;
}

export interface ReportFeedbackCountItem<TKey extends string = string> {
  key: TKey;
  label: string;
  count: number;
}

export interface ReportFeedbackRecentEntry {
  id: string;
  reportId: string;
  verdict?: Verdict;
  decisionOutcome?: ReportDecisionOutcome;
  accuracyFeedback?: ReportAccuracyFeedback;
  blockingCategory?: ReportFeedbackCategory;
  missedRiskCategory?: ReportFeedbackCategory;
  note?: string;
  createdAt: Date;
}

export interface ReportFeedbackMetrics {
  total: number;
  outcomeCounts: ReportFeedbackCountItem<ReportDecisionOutcome>[];
  accuracyCounts: ReportFeedbackCountItem<ReportAccuracyFeedback>[];
  blockingCategoryCounts: ReportFeedbackCountItem<ReportFeedbackCategory>[];
  missedRiskCategoryCounts: ReportFeedbackCountItem<ReportFeedbackCategory>[];
  negotiableMissCounts: ReportFeedbackCountItem<ReportFeedbackCategory>[];
  verifyToHardRiskCounts: ReportFeedbackCountItem<ReportFeedbackCategory>[];
  recentEntries: ReportFeedbackRecentEntry[];
}

// ========== 规则类型 ==========
export interface Rule {
  id: string;
  name: string;
  condition: (input: NormalizedInput) => boolean;
  effects: {
    scoreDeltas?: Partial<Record<Dimension, number>>;
    risk?: Omit<RiskItem, "id">;
    actionHints?: string[];
  };
}

// ========== 引擎配置 ==========
export interface EngineConfig {
  baseScore: number;
  minScore: number;
  maxScore: number;
}

export const defaultConfig: EngineConfig = {
  baseScore: 70,
  minScore: 0,
  maxScore: 100,
};
