import { 
  EvaluationInput, 
  EngineResult, 
  Dimension, 
  DimensionScore, 
  RiskItem,
  PrimaryGoal,
} from './types';
import { normalizeInput } from './normalize';
import { getRules } from './rules';
import { recommendActions } from './recommend';
import { defaultConfig } from './types';
import { calculateVerdict } from './verdict';
import { generateDecisionNote } from './decision-note';

export * from './types';
export * from './verdict';
export * from './decision-note';
export { normalizeInput } from './normalize';
export { getRules } from './rules';
export { recommendActions } from './recommend';

export function evaluate(input: EvaluationInput): EngineResult {
  const normalized = normalizeInput(input);
  const rules = getRules();
  
  // 初始化分数（基础分70）
  const scores: Record<Dimension, number> = {
    lighting: defaultConfig.baseScore,
    noise: defaultConfig.baseScore,
    dampness: defaultConfig.baseScore,
    privacy: defaultConfig.baseScore,
    circulation: defaultConfig.baseScore,
    focus: defaultConfig.baseScore,
  };
  
  const risks: RiskItem[] = [];
  const actionSignals = new Set<string>();
  const dimensionFactors: Record<Dimension, Array<{name: string, impact: number, reason: string}>> = {
    lighting: [],
    noise: [],
    dampness: [],
    privacy: [],
    circulation: [],
    focus: [],
  };
  
  // 执行所有规则
  for (const rule of rules) {
    try {
      if (rule.condition(normalized)) {
        // 应用分数变化
        if (rule.effects.scoreDeltas) {
          for (const [dim, delta] of Object.entries(rule.effects.scoreDeltas)) {
            if (delta) {
              scores[dim as Dimension] += delta;
              dimensionFactors[dim as Dimension].push({
                name: rule.name,
                impact: delta,
                reason: rule.effects.risk?.modernReason || rule.name,
              });
            }
          }
        }
        
        // 收集风险
        if (rule.effects.risk) {
          risks.push({
            id: rule.id,
            ...rule.effects.risk,
          });
        }
        
        // 收集动作线索
        if (rule.effects.actionHints) {
          rule.effects.actionHints.forEach(hint => actionSignals.add(hint));
        }
      }
    } catch (e) {
      console.error(`Rule ${rule.id} failed:`, e);
    }
  }
  
  // 限制分数范围（系统不变量）
  for (const dim of Object.keys(scores) as Dimension[]) {
    scores[dim] = Math.max(defaultConfig.minScore, Math.min(defaultConfig.maxScore, scores[dim]));
  }
  
  // 构建 DimensionScore 数组
  const dimensions: DimensionScore[] = (Object.keys(scores) as Dimension[]).map(dim => ({
    dimension: dim,
    score: Math.round(scores[dim]),
    weight: getDimensionWeight(dim, normalized.primaryGoal),
    factors: dimensionFactors[dim],
  }));
  
  // 计算总分（加权平均）
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight
  );
  
  // 风险排序（高严重度优先，同严重度下场景相关维度优先）
  risks.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    // 同严重度下，按场景维度相关性排序
    const sceneBonusA = getSceneDimensionBonus(a.dimension, normalized.primaryGoal);
    const sceneBonusB = getSceneDimensionBonus(b.dimension, normalized.primaryGoal);
    return sceneBonusB - sceneBonusA;
  });
  
  // 生成推荐
  const actions = recommendActions(risks, normalized);
  
  // 判定结论（使用分层决策体系）
  const verdict = calculateVerdict({
    score: overallScore,
    risks,
    input: normalized,
  });
  
  // 生成决策提示
  const decisionNote = generateDecisionNote(risks, normalized);
  
  // 构建结果
  const result: EngineResult = {
    scores,
    overallScore,
    dimensions,
    risks: risks.slice(0, 3), // 只返回前3个风险
    actions,
    decisionNote,
    verdict,
  };
  
  return result;
}

function getDimensionWeight(dim: Dimension, goal: PrimaryGoal): number {
  const weights: Record<PrimaryGoal, Record<Dimension, number>> = {
    'sleep_quality': { lighting: 0.9, noise: 1.3, dampness: 1.0, privacy: 1.1, circulation: 0.8, focus: 0.7 },
    'wfh': { lighting: 1.1, noise: 1.2, dampness: 0.9, privacy: 1.0, circulation: 0.9, focus: 1.3 },
    'exam_prep': { lighting: 1.0, noise: 1.3, dampness: 0.9, privacy: 1.1, circulation: 0.8, focus: 1.2 },
    'couple': { lighting: 1.0, noise: 1.0, dampness: 1.0, privacy: 1.2, circulation: 1.0, focus: 0.8 },
    'elderly_safety': { lighting: 1.0, noise: 0.9, dampness: 1.2, privacy: 0.9, circulation: 1.3, focus: 0.7 },
  };
  
  return weights[goal]?.[dim] ?? 1.0;
}

// 场景维度排序加权：同严重度下，场景相关维度优先
function getSceneDimensionBonus(dim: Dimension, goal: PrimaryGoal): number {
  const bonusMap: Record<PrimaryGoal, Partial<Record<Dimension, number>>> = {
    elderly_safety: { circulation: 30, dampness: 20 },  // 老人场景：动线/潮湿优先
    exam_prep: { noise: 25, focus: 25 },               // 备考：噪音/专注优先
    sleep_quality: { noise: 25, lighting: 15 },        // 睡眠：噪音/采光优先
    couple: { privacy: 20, circulation: 10 },          // 情侣：隐私优先
    wfh: { focus: 20, noise: 15 },                     // WFH：专注/噪音优先
  };
  
  return bonusMap[goal]?.[dim] ?? 0;
}
