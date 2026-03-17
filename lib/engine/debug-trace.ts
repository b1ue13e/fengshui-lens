// 调试追踪工具 - 用于分析具体案例的判定路径
import { evaluate } from './index';
import { EvaluationInput, EngineResult } from './types';
import { calculateVerdict } from './verdict';

interface TraceResult {
  input: EvaluationInput;
  output: EngineResult;
  trace: {
    rulesHit: string[];
    scoreChanges: Record<string, number>;
    risksGenerated: string[];
    verdictPath: string[];
  };
}

export function traceEvaluation(input: EvaluationInput): TraceResult {
  const output = evaluate(input);
  
  // 追踪 verdict 路径
  const verdictPath: string[] = [];
  const { overallScore, risks } = output;
  const highRisks = risks.filter(r => r.severity === 'high');
  
  verdictPath.push(`总分: ${overallScore}, 高危风险数: ${highRisks.length}`);
  
  // 重建 verdict 判定逻辑
  const riskCodes = new Set(risks.map(r => r.id));
  
  // 检查难以缓解的高危组合
  if (input.primaryGoal === 'exam_prep') {
    if (riskCodes.has('street_noise')) {
      if (!input.allowsSoftImprovements) {
        verdictPath.push('命中: 备考+临街噪音+无法改善 → avoid');
      } else {
        verdictPath.push('未命中: 备考+临街噪音，但允许改善 → 继续检查');
      }
    }
  }
  
  // 检查场景致命单点
  if (input.primaryGoal === 'exam_prep' && riskCodes.has('street_noise')) {
    verdictPath.push('命中: 备考场景+临街噪音(high) → 应触发 fatal single point');
  }
  
  // 基础阈值
  if (overallScore >= 75 && highRisks.length === 0) {
    verdictPath.push('阈值判定: score>=75 且无高危 → rent');
  } else if (overallScore >= 55 && highRisks.length <= 1) {
    verdictPath.push(`阈值判定: score>=55 (${overallScore}) 且高危<=1 (${highRisks.length}) → cautious`);
  } else {
    verdictPath.push(`阈值判定: score<55 或高危>1 → avoid`);
  }
  
  return {
    input,
    output,
    trace: {
      rulesHit: output.dimensions.flatMap(d => d.factors.map(f => f.name)),
      scoreChanges: output.scores,
      risksGenerated: output.risks.map(r => `${r.title}(${r.severity})`),
      verdictPath,
    }
  };
}

// 分析争议案例
export function analyzeDisputedCases() {
  // 案例1: 三里屯临街一居室（备考场景）
  const case1Input: EvaluationInput = {
    layoutType: "one_bedroom",
    areaSqm: 45,
    orientation: "south",
    floorLevel: "middle",
    totalFloors: 18,
    hasElevator: true,
    buildingAge: "medium",
    hasWestFacingWindow: false,
    windowExposure: "full",
    facesMainRoad: true,
    nearElevator: false,
    unitPosition: "middle",
    hasBalcony: true,
    kitchenType: "closed",
    bathroomPosition: "far_from_bedroom",
    bedPosition: "away_from_door",
    deskPosition: "facing_window",
    ventilation: "good",
    dampSigns: [],
    isShared: false,
    primaryGoal: "exam_prep",
    monthlyBudget: "medium",
    allowsLightRenovation: true,
    allowsFurnitureMove: true,
    allowsSoftImprovements: true,
  };
  
  // 案例2: 五道口合租主卧（情侣场景）
  const case2Input: EvaluationInput = {
    layoutType: "studio",
    areaSqm: 20,
    orientation: "south",
    floorLevel: "high",
    totalFloors: 28,
    hasElevator: true,
    buildingAge: "new",
    hasWestFacingWindow: false,
    windowExposure: "full",
    facesMainRoad: false,
    nearElevator: true,
    unitPosition: "corner",
    hasBalcony: false,
    kitchenType: "open",
    bathroomPosition: "near_bedroom",
    bedPosition: "away_from_door",
    deskPosition: "facing_wall",
    ventilation: "good",
    dampSigns: [],
    isShared: true,
    roommateSituation: "strangers",
    primaryGoal: "couple",
    monthlyBudget: "medium",
    allowsLightRenovation: true,
    allowsFurnitureMove: true,
    allowsSoftImprovements: true,
  };
  
  return {
    case1: traceEvaluation(case1Input),
    case2: traceEvaluation(case2Input),
  };
}
