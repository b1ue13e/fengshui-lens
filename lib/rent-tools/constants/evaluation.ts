// 租房风险评估引擎常量
// 所有机器值使用 snake_case，展示文案通过 labels map 获取

// ========== 基础信息 ==========
export const LAYOUT_TYPES = [
  'studio',
  'one_bedroom',
  'two_bedroom',
  'three_bedroom',
] as const;
export type LayoutType = typeof LAYOUT_TYPES[number];

export const LAYOUT_TYPE_LABELS: Record<LayoutType, string> = {
  'studio': '开间/大单间',
  'one_bedroom': '一室一厅',
  'two_bedroom': '两室一厅',
  'three_bedroom': '三室及以上',
};

export const ORIENTATIONS = [
  'south',
  'southeast',
  'southwest',
  'east',
  'west',
  'north',
  'northeast',
  'northwest',
] as const;
export type Orientation = typeof ORIENTATIONS[number];

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  'south': '正南',
  'southeast': '东南',
  'southwest': '西南',
  'east': '正东',
  'west': '正西',
  'north': '正北',
  'northeast': '东北',
  'northwest': '西北',
};

export const FLOOR_LEVELS = ['low', 'middle', 'high', 'top'] as const;
export type FloorLevel = typeof FLOOR_LEVELS[number];

export const FLOOR_LEVEL_LABELS: Record<FloorLevel, string> = {
  'low': '低楼层（1-3层）',
  'middle': '中楼层',
  'high': '高楼层',
  'top': '顶层',
};

export const BUILDING_AGES = ['old', 'medium', 'new'] as const;
export type BuildingAge = typeof BUILDING_AGES[number];

export const BUILDING_AGE_LABELS: Record<BuildingAge, string> = {
  'old': '老小区（>15年）',
  'medium': '次新（5-15年）',
  'new': '新小区（<5年）',
};

// ========== 空间细节 ==========
export const KITCHEN_TYPES = ['open', 'closed', 'semi_open'] as const;
export type KitchenType = typeof KITCHEN_TYPES[number];

export const KITCHEN_TYPE_LABELS: Record<KitchenType, string> = {
  'open': '开放式厨房',
  'closed': '封闭式厨房',
  'semi_open': '半开放式',
};

export const BATHROOM_POSITIONS = [
  'near_bedroom',
  'far_from_bedroom',
  'adjacent_bedroom',
] as const;
export type BathroomPosition = typeof BATHROOM_POSITIONS[number];

export const BATHROOM_POSITION_LABELS: Record<BathroomPosition, string> = {
  'near_bedroom': '靠近卧室',
  'far_from_bedroom': '远离卧室',
  'adjacent_bedroom': '与卧室相邻/共墙',
};

export const BED_POSITIONS = [
  'away_from_door',
  'near_door',
  'facing_door',
  'beside_window',
] as const;
export type BedPosition = typeof BED_POSITIONS[number];

export const BED_POSITION_LABELS: Record<BedPosition, string> = {
  'away_from_door': '远离门',
  'near_door': '靠近门',
  'facing_door': '正对门',
  'beside_window': '靠窗',
};

export const DESK_POSITIONS = [
  'facing_window',
  'back_to_window',
  'facing_wall',
  'no_space',
] as const;
export type DeskPosition = typeof DESK_POSITIONS[number];

export const DESK_POSITION_LABELS: Record<DeskPosition, string> = {
  'facing_window': '面向窗户',
  'back_to_window': '背对窗户',
  'facing_wall': '面对墙壁',
  'no_space': '没有独立书桌空间',
};

export const VENTILATION_TYPES = [
  'good',
  'poor',
  'cross_breeze',
  'none',
] as const;
export type Ventilation = typeof VENTILATION_TYPES[number];

export const VENTILATION_LABELS: Record<Ventilation, string> = {
  'good': '通风良好',
  'poor': '通风一般',
  'cross_breeze': '南北通透/对流',
  'none': '通风差',
};

// ========== 居住需求 ==========
export const PRIMARY_GOALS = [
  'exam_prep',
  'sleep_quality',
  'wfh',
  'couple',
  'elderly_safety',
] as const;
export type PrimaryGoal = typeof PRIMARY_GOALS[number];

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, { label: string; desc: string }> = {
  'exam_prep': { label: '备考学习', desc: '需要安静、专注的环境' },
  'sleep_quality': { label: '睡眠质量优先', desc: '对安静、遮光要求高' },
  'wfh': { label: '居家办公', desc: '需要独立工作空间' },
  'couple': { label: '情侣同住', desc: '注重隐私和生活品质' },
  'elderly_safety': { label: '老人居住', desc: '安全、便利优先' },
};

export const BUDGET_RANGES = ['low', 'medium', 'high'] as const;
export type BudgetRange = typeof BUDGET_RANGES[number];

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  'low': '经济型（月租<3000）',
  'medium': '舒适型（3000-6000）',
  'high': '品质型（>6000）',
};

// ========== 引擎维度 ==========
export const DIMENSIONS = [
  'lighting',
  'noise',
  'dampness',
  'privacy',
  'circulation',
  'focus',
] as const;
export type Dimension = typeof DIMENSIONS[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  'lighting': '采光',
  'noise': '噪音',
  'dampness': '潮湿',
  'privacy': '隐私',
  'circulation': '动线',
  'focus': '专注',
};

// ========== 结论 ==========
export const VERDICTS = ['rent', 'cautious', 'avoid'] as const;
export type Verdict = typeof VERDICTS[number];

export const VERDICT_LABELS: Record<Verdict, { label: string; color: string }> = {
  'rent': { label: '值得租', color: 'bg-green-100 text-green-800' },
  'cautious': { label: '谨慎考虑', color: 'bg-amber-100 text-amber-800' },
  'avoid': { label: '不建议租', color: 'bg-red-100 text-red-800' },
};

// ========== 窗口暴露 ==========
export const WINDOW_EXPOSURES = ['full', 'partial', 'blocked'] as const;
export type WindowExposure = typeof WINDOW_EXPOSURES[number];

export const WINDOW_EXPOSURE_LABELS: Record<WindowExposure, string> = {
  'full': '无遮挡，采光好',
  'partial': '部分遮挡',
  'blocked': '严重遮挡',
};

// ========== 单元位置 ==========
export const UNIT_POSITIONS = ['corner', 'middle', 'end'] as const;
export type UnitPosition = typeof UNIT_POSITIONS[number];

export const UNIT_POSITION_LABELS: Record<UnitPosition, string> = {
  'corner': '边户',
  'middle': '中间户',
  'end': '顶楼/底楼特殊位置',
};

// ========== 风险严重度 ==========
export const SEVERITY_LEVELS = ['high', 'medium', 'low'] as const;
export type Severity = typeof SEVERITY_LEVELS[number];

// ========== 成本级别 ==========
export const COST_LEVELS = ['free', 'low', 'medium', 'high'] as const;
export type CostLevel = typeof COST_LEVELS[number];

// ========== 难度级别 ==========
export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
export type Difficulty = typeof DIFFICULTY_LEVELS[number];

// ========== 场景类型 ==========
export const CHAT_SCENARIOS = ['negotiate', 'repair', 'renovation'] as const;
export type ChatScenario = typeof CHAT_SCENARIOS[number];

// ========== 类型守卫函数 ==========

export function isLayoutType(value: string): value is LayoutType {
  return LAYOUT_TYPES.includes(value as LayoutType);
}

export function isOrientation(value: string): value is Orientation {
  return ORIENTATIONS.includes(value as Orientation);
}

export function isFloorLevel(value: string): value is FloorLevel {
  return FLOOR_LEVELS.includes(value as FloorLevel);
}

export function isBuildingAge(value: string): value is BuildingAge {
  return BUILDING_AGES.includes(value as BuildingAge);
}

export function isPrimaryGoal(value: string): value is PrimaryGoal {
  return PRIMARY_GOALS.includes(value as PrimaryGoal);
}

export function isBudgetRange(value: string): value is BudgetRange {
  return BUDGET_RANGES.includes(value as BudgetRange);
}

export function isVerdict(value: string): value is Verdict {
  return VERDICTS.includes(value as Verdict);
}

export function isDimension(value: string): value is Dimension {
  return DIMENSIONS.includes(value as Dimension);
}

export function isSeverity(value: string): value is Severity {
  return SEVERITY_LEVELS.includes(value as Severity);
}
