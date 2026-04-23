// 租房风险评估常量
// 所有机器值使用 snake_case，展示文案通过 labels map 获取

// ========== 基础信息 ==========
export const LAYOUT_TYPES = [
  "studio",
  "one_bedroom",
  "two_bedroom",
  "three_bedroom",
] as const;
export type LayoutType = typeof LAYOUT_TYPES[number];

export const LAYOUT_TYPE_LABELS: Record<LayoutType, string> = {
  studio: "开间 / 大单间",
  one_bedroom: "一室一厅",
  two_bedroom: "两室一厅",
  three_bedroom: "三室及以上",
};

export const ORIENTATIONS = [
  "south",
  "southeast",
  "southwest",
  "east",
  "west",
  "north",
  "northeast",
  "northwest",
] as const;
export type Orientation = typeof ORIENTATIONS[number];

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  south: "正南",
  southeast: "东南",
  southwest: "西南",
  east: "正东",
  west: "正西",
  north: "正北",
  northeast: "东北",
  northwest: "西北",
};

export const FLOOR_LEVELS = ["low", "middle", "high", "top"] as const;
export type FloorLevel = typeof FLOOR_LEVELS[number];

export const FLOOR_LEVEL_LABELS: Record<FloorLevel, string> = {
  low: "低楼层（1-3 层）",
  middle: "中楼层",
  high: "高楼层",
  top: "顶层",
};

export const BUILDING_AGES = ["old", "medium", "new"] as const;
export type BuildingAge = typeof BUILDING_AGES[number];

export const BUILDING_AGE_LABELS: Record<BuildingAge, string> = {
  old: "老小区（>15 年）",
  medium: "次新（5-15 年）",
  new: "新小区（<5 年）",
};

// ========== 空间细节 ==========
export const KITCHEN_TYPES = ["open", "closed", "semi_open"] as const;
export type KitchenType = typeof KITCHEN_TYPES[number];

export const KITCHEN_TYPE_LABELS: Record<KitchenType, string> = {
  open: "开放式厨房",
  closed: "封闭式厨房",
  semi_open: "半开放式",
};

export const BATHROOM_POSITIONS = [
  "near_bedroom",
  "far_from_bedroom",
  "adjacent_bedroom",
] as const;
export type BathroomPosition = typeof BATHROOM_POSITIONS[number];

export const BATHROOM_POSITION_LABELS: Record<BathroomPosition, string> = {
  near_bedroom: "靠近卧室",
  far_from_bedroom: "远离卧室",
  adjacent_bedroom: "与卧室相邻 / 共墙",
};

export const BED_POSITIONS = [
  "away_from_door",
  "near_door",
  "facing_door",
  "beside_window",
] as const;
export type BedPosition = typeof BED_POSITIONS[number];

export const BED_POSITION_LABELS: Record<BedPosition, string> = {
  away_from_door: "远离门",
  near_door: "靠近门",
  facing_door: "正对门",
  beside_window: "靠窗",
};

export const DESK_POSITIONS = [
  "facing_window",
  "back_to_window",
  "facing_wall",
  "no_space",
] as const;
export type DeskPosition = typeof DESK_POSITIONS[number];

export const DESK_POSITION_LABELS: Record<DeskPosition, string> = {
  facing_window: "面向窗户",
  back_to_window: "背对窗户",
  facing_wall: "面对墙面",
  no_space: "没有独立书桌 / 工位空间",
};

export const VENTILATION_TYPES = [
  "good",
  "poor",
  "cross_breeze",
  "none",
] as const;
export type Ventilation = typeof VENTILATION_TYPES[number];

export const VENTILATION_LABELS: Record<Ventilation, string> = {
  good: "通风良好",
  poor: "通风一般",
  cross_breeze: "南北通透 / 对流",
  none: "通风差",
};

// ========== 居住需求 ==========
export const PRIMARY_GOALS = [
  "exam_prep",
  "sleep_quality",
  "wfh",
  "couple",
  "elderly_safety",
] as const;
export type PrimaryGoal = typeof PRIMARY_GOALS[number];

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, { label: string; desc: string }> = {
  exam_prep: { label: "备考 / 学习", desc: "需要安静、专注的环境" },
  sleep_quality: { label: "睡眠质量优先", desc: "对安静、遮光要求高" },
  wfh: { label: "居家办公", desc: "需要独立工作空间" },
  couple: { label: "情侣同住", desc: "注重隐私和生活边界" },
  elderly_safety: { label: "老人居住", desc: "安全、便利优先" },
};

export const BUDGET_RANGES = ["low", "medium", "high"] as const;
export type BudgetRange = typeof BUDGET_RANGES[number];

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  low: "经济型（月租 < 3000）",
  medium: "舒适型（3000-6000）",
  high: "品质型（> 6000）",
};

export const COMMUTE_TOLERANCES = [
  "under_30",
  "under_45",
  "under_60",
  "flexible",
] as const;
export type CommuteTolerance = typeof COMMUTE_TOLERANCES[number];

export const COMMUTE_TOLERANCE_LABELS: Record<
  CommuteTolerance,
  { label: string; desc: string }
> = {
  under_30: { label: "30 分钟内", desc: "更想把体力和时间留给工作或休息" },
  under_45: { label: "45 分钟内", desc: "能接受常见通勤，但不想被拉太长" },
  under_60: { label: "60 分钟内", desc: "可以接受拉长一点，但不能失控" },
  flexible: { label: "先不设死线", desc: "还在看选择，先记录真实时间" },
};

export const PAYMENT_CYCLES = [
  "monthly",
  "every_two_months",
  "quarterly",
  "half_yearly",
] as const;
export type PaymentCycle = typeof PAYMENT_CYCLES[number];

export const PAYMENT_CYCLE_LABELS: Record<PaymentCycle, string> = {
  monthly: "押一付一 / 月付",
  every_two_months: "押一付二",
  quarterly: "押一付三",
  half_yearly: "半年付",
};

export const LANDLORD_TYPES = [
  "direct_landlord",
  "agent",
  "sublessor",
  "unknown",
] as const;
export type LandlordType = typeof LANDLORD_TYPES[number];

export const LANDLORD_TYPE_LABELS: Record<
  LandlordType,
  { label: string; desc: string }
> = {
  direct_landlord: { label: "房东直租", desc: "身份链路清楚，后续扯皮成本通常更低" },
  agent: { label: "中介 / 托管", desc: "可以接受，但要把收费和主体写清楚" },
  sublessor: { label: "二房东 / 转租", desc: "要重点核验转租授权和退押链路" },
  unknown: { label: "还没搞清", desc: "主体不明时，先按高风险处理" },
};

export const CONTRACT_VISIBILITIES = [
  "reviewed_clear",
  "reviewed_with_risks",
  "not_reviewed",
  "refuses_to_share",
] as const;
export type ContractVisibility = typeof CONTRACT_VISIBILITIES[number];

export const CONTRACT_VISIBILITY_LABELS: Record<
  ContractVisibility,
  { label: string; desc: string }
> = {
  reviewed_clear: { label: "已经看过，条款基本清楚", desc: "至少能确认主体、押付、违约和退租规则" },
  reviewed_with_risks: { label: "看过，但有明显疑点", desc: "存在违约、退押或责任划分上的担心" },
  not_reviewed: { label: "还没看到合同", desc: "目前只有口头承诺或聊天说明" },
  refuses_to_share: { label: "不愿提前给看", desc: "签约前不给合同通常要提高警惕" },
};

export const LISTING_MATCH_LEVELS = [
  "matches_listing",
  "minor_gaps",
  "major_gaps",
  "not_seen_yet",
] as const;
export type ListingMatchLevel = typeof LISTING_MATCH_LEVELS[number];

export const LISTING_MATCH_LEVEL_LABELS: Record<
  ListingMatchLevel,
  { label: string; desc: string }
> = {
  matches_listing: { label: "现场和页面基本一致", desc: "图片、面积、朝向和描述没有明显落差" },
  minor_gaps: { label: "有落差，但还能接受", desc: "细节和页面不完全一致，需要继续追问" },
  major_gaps: { label: "信息失真明显", desc: "照片、面积、朝向或房况和页面差很多" },
  not_seen_yet: { label: "还没实地看房", desc: "目前只能相信页面和聊天内容" },
};

export const SHARED_SPACE_RULES = [
  "clear",
  "some_uncertainty",
  "messy_or_unclear",
] as const;
export type SharedSpaceRules = typeof SHARED_SPACE_RULES[number];

export const SHARED_SPACE_RULE_LABELS: Record<
  SharedSpaceRules,
  { label: string; desc: string }
> = {
  clear: { label: "公共空间规则清楚", desc: "卫生、作息、访客和分摊方式都讲明白了" },
  some_uncertainty: { label: "还有几项没讲透", desc: "能住，但后续容易在细节上起摩擦" },
  messy_or_unclear: { label: "公共空间风险高", desc: "作息、卫生或访客边界都比较乱" },
};

// ========== 评估维度 ==========
export const DIMENSIONS = [
  "lighting",
  "noise",
  "dampness",
  "privacy",
  "circulation",
  "focus",
] as const;
export type Dimension = typeof DIMENSIONS[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  lighting: "采光",
  noise: "噪音",
  dampness: "潮湿",
  privacy: "隐私",
  circulation: "动线",
  focus: "专注",
};

export const DECISION_PILLARS = [
  "cash_flow",
  "commute",
  "contract",
  "listing_trust",
  "flatshare",
] as const;
export type DecisionPillar = typeof DECISION_PILLARS[number];

export const DECISION_PILLAR_LABELS: Record<DecisionPillar, string> = {
  cash_flow: "现金流",
  commute: "通勤",
  contract: "合同与主体",
  listing_trust: "房源可信度",
  flatshare: "合租关系",
};

// ========== 结论 ==========
export const VERDICTS = ["rent", "cautious", "avoid"] as const;
export type Verdict = typeof VERDICTS[number];

export const VERDICT_LABELS: Record<Verdict, { label: string; color: string }> = {
  rent: { label: "值得继续租", color: "bg-green-100 text-green-800" },
  cautious: { label: "谨慎考虑", color: "bg-amber-100 text-amber-800" },
  avoid: { label: "不建议租", color: "bg-red-100 text-red-800" },
};

// ========== 窗口暴露 ==========
export const WINDOW_EXPOSURES = ["full", "partial", "blocked"] as const;
export type WindowExposure = typeof WINDOW_EXPOSURES[number];

export const WINDOW_EXPOSURE_LABELS: Record<WindowExposure, string> = {
  full: "无遮挡，采光好",
  partial: "部分遮挡",
  blocked: "严重遮挡",
};

// ========== 单元位置 ==========
export const UNIT_POSITIONS = ["corner", "middle", "end"] as const;
export type UnitPosition = typeof UNIT_POSITIONS[number];

export const UNIT_POSITION_LABELS: Record<UnitPosition, string> = {
  corner: "边户",
  middle: "中间户",
  end: "顶楼 / 底楼等特殊位置",
};

// ========== 风险严重度 ==========
export const SEVERITY_LEVELS = ["high", "medium", "low"] as const;
export type Severity = typeof SEVERITY_LEVELS[number];

// ========== 成本级别 ==========
export const COST_LEVELS = ["free", "low", "medium", "high"] as const;
export type CostLevel = typeof COST_LEVELS[number];

// ========== 难度级别 ==========
export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
export type Difficulty = typeof DIFFICULTY_LEVELS[number];

// ========== 场景类型 ==========
export const CHAT_SCENARIOS = ["negotiate", "repair", "renovation"] as const;
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

export function isCommuteTolerance(value: string): value is CommuteTolerance {
  return COMMUTE_TOLERANCES.includes(value as CommuteTolerance);
}

export function isPaymentCycle(value: string): value is PaymentCycle {
  return PAYMENT_CYCLES.includes(value as PaymentCycle);
}

export function isLandlordType(value: string): value is LandlordType {
  return LANDLORD_TYPES.includes(value as LandlordType);
}

export function isContractVisibility(value: string): value is ContractVisibility {
  return CONTRACT_VISIBILITIES.includes(value as ContractVisibility);
}

export function isListingMatchLevel(value: string): value is ListingMatchLevel {
  return LISTING_MATCH_LEVELS.includes(value as ListingMatchLevel);
}

export function isSharedSpaceRules(value: string): value is SharedSpaceRules {
  return SHARED_SPACE_RULES.includes(value as SharedSpaceRules);
}
