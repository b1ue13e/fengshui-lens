import { RiskItem, RecommendedAction, NormalizedInput, PrimaryGoal } from './types';
import { actionRegistry } from '../actions/registry';
import { riskActionMap } from '../actions/mappings';

interface ActionCandidate {
  code: string;
  action: typeof actionRegistry[string];
  targetRisks: RiskItem[];
  score: number;
}

// 场景匹配加分计算
function calculateSceneMatchBonus(
  code: string, 
  goal: PrimaryGoal, 
  targetRisks: RiskItem[],
  input: NormalizedInput
): number {
  let bonus = 0;
  
  // elderly_safety 场景：扶手/防滑条优先
  if (goal === 'elderly_safety') {
    if (code === 'add_handrail' || code === 'anti_slip') {
      bonus += 15;  // 老人场景核心动作
    }
    // 无潮湿迹象时，降低除湿机优先级
    if (code === 'dehumidifier' && !targetRisks.some(r => r.id === 'damp_signs' || r.id === 'ground_floor_damp')) {
      bonus -= 6;  // 保守负分，避免无潮湿时除湿机排第一
    }
  }
  
  // couple + shared + friends 场景：软性措施优先于硬性隔断
  if (goal === 'couple' && input.isShared && input.roommateSituation === 'friends') {
    // 朋友合租场景，物理隔断的优先级降低（但仍然是推荐动作）
    if (code === 'room_divider') {
      bonus -= 5;  // 轻微降低，不让它抢第一
    }
  }
  
  return bonus;
}

export function recommendActions(
  risks: RiskItem[],
  input: NormalizedInput
): RecommendedAction[] {
  // 收集所有候选动作
  const candidateMap = new Map<string, ActionCandidate>();
  
  for (const risk of risks) {
    const actionCodes = riskActionMap[risk.id] || [];
    
    for (const code of actionCodes) {
      const action = actionRegistry[code];
      if (!action) continue;
      
      // 检查用户约束
      if (action.requirements.needsFurnitureMove && !input.allowsFurnitureMove) {
        continue;
      }
      if (action.requirements.needsLightRenovation && !input.allowsLightRenovation) {
        continue;
      }
      if (action.requirements.needsBuyMaterials && !input.allowsSoftImprovements) {
        continue;
      }
      
      if (candidateMap.has(code)) {
        candidateMap.get(code)!.targetRisks.push(risk);
      } else {
        candidateMap.set(code, {
          code,
          action,
          targetRisks: [risk],
          score: 0,
        });
      }
    }
  }
  
  // 计算每个候选的得分
  const candidates = Array.from(candidateMap.values()).map(candidate => {
    const severityScore = candidate.targetRisks.reduce((sum, risk) => {
      const weights = { high: 40, medium: 25, low: 10 };
      return sum + weights[risk.severity];
    }, 0);
    
    const benefitScore = candidate.action.expectedBenefit.score * 3;
    
    const costScores = { free: 20, low: 15, medium: 8, high: 0 };
    const costScore = costScores[candidate.action.costLevel];
    
    const difficultyScores = { easy: 10, medium: 5, hard: 0 };
    const difficultyScore = difficultyScores[candidate.action.difficulty];
    
    // 解决多个问题的奖励
    const multiBonus = candidate.targetRisks.length > 1 ? 10 : 0;
    
    // 场景匹配加分
    const sceneMatchBonus = calculateSceneMatchBonus(
      candidate.code, 
      input.primaryGoal, 
      candidate.targetRisks,
      input
    );
    
    candidate.score = severityScore + benefitScore + costScore + difficultyScore + multiBonus + sceneMatchBonus;
    
    return candidate;
  });
  
  // 排序并取前3
  candidates.sort((a, b) => b.score - a.score);
  
  return candidates.slice(0, 3).map((candidate, index) => {
    const primaryRisk = candidate.targetRisks[0];
    
    let priorityReason = '';
    if (index === 0) {
      priorityReason = `这是解决${primaryRisk.title}最有效的方式，投入${candidate.action.costRange}即可显著改善`;
    } else if (candidate.action.costLevel === 'free' || candidate.action.costLevel === 'low') {
      priorityReason = `成本仅${candidate.action.costRange}，实施简单，性价比极高`;
    } else if (candidate.action.difficulty === 'easy') {
      priorityReason = `无需复杂操作，${candidate.action.timeRequired}即可完成，立即生效`;
    } else {
      priorityReason = `针对${primaryRisk.title}的针对性解决方案，效果明确`;
    }
    
    return {
      ...candidate.action,
      targetsRisks: candidate.targetRisks.map(r => r.id),
      priorityReason,
    };
  });
}
