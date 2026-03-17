// SpaceRisk Core Types - 基于 lib/constants/evaluation.ts

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
} from '@/lib/constants/evaluation';

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
};

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
  dampSigns?: string[];
  isShared: boolean;
  roommateSituation?: string;

  // Step 3: 居住需求
  primaryGoal: PrimaryGoal;
  monthlyBudget: BudgetRange;
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

// ========== 风险类型 ==========
export interface RiskItem {
  id: string;
  severity: Severity;
  dimension: Dimension;
  title: string;
  description: string;
  modernReason: string;
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

// ========== 引擎结果 ==========
export interface EngineResult {
  scores: Record<Dimension, number>;
  overallScore: number;
  dimensions: DimensionScore[];
  risks: RiskItem[];
  actions: RecommendedAction[];
  verdict: Verdict;
  decisionNote?: import('./decision-note').DecisionNote;  // 决策提示（可选）
}

// ========== 完整报告（存储用） ==========
export interface EvaluationReport extends EngineResult {
  id: string;
  createdAt: Date;
  summaryText: string;
  chatScripts: ChatScript[];
}

// ========== 规则类型 ==========
export interface Rule {
  id: string;
  name: string;
  condition: (input: NormalizedInput) => boolean;
  effects: {
    scoreDeltas?: Partial<Record<Dimension, number>>;
    risk?: Omit<RiskItem, 'id'>;
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
