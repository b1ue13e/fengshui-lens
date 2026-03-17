import { RiskItem, NormalizedInput, PrimaryGoal } from './types';

export interface DecisionNote {
  type: 'structural_defect' | 'shared_coordination' | 'mitigation_limited';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

/**
 * 生成决策提示 - 独立于 risk ranking 和 action ranking
 * 用于表达结构性缺陷建议、同住协商建议等
 */
export function generateDecisionNote(
  risks: RiskItem[],
  input: NormalizedInput
): DecisionNote | undefined {
  const { primaryGoal, isShared, roommateSituation, facesMainRoad, floorLevel, buildingAge } = input;

  // 1. 结构性缺陷：备考 + 临街噪音（特别是中低楼层）
  if (primaryGoal === 'exam_prep' && facesMainRoad) {
    const hasStreetNoise = risks.some(r => 
      (r.id === 'street_noise_low' || r.id === 'street_noise_high') && 
      r.severity === 'high'
    );
    if (hasStreetNoise) {
      return {
        type: 'structural_defect',
        title: '结构性缺陷提示',
        message: '临街噪音对备考场景影响较大，低成本改造（如密封条、厚窗帘）只能缓解而无法根本解决。如果噪音问题严重，相比持续投入改造预算，更合理的选择是优先考虑更安静、更匹配的房源条件。',
        severity: 'high',
      };
    }
  }

  // 2. 结构性缺陷：情侣 + 合租 + 陌生人
  if (primaryGoal === 'couple' && isShared && roommateSituation === 'strangers') {
    return {
      type: 'structural_defect',
      title: '结构性缺陷提示',
      message: '与陌生人合租对情侣隐私是结构性限制，物理隔断（如屏风、门帘）只能提供有限改善。相比在有限空间内持续改造，整租一居或两居可能是更合理的选择。',
      severity: 'high',
    };
  }

  // 3. 结构性缺陷：老人 + 无电梯 + 高楼层
  if (primaryGoal === 'elderly_safety') {
    const hasNoElevator = risks.some(r => r.id === 'no_elevator');
    if (hasNoElevator) {
      return {
        type: 'structural_defect',
        title: '结构性缺陷提示',
        message: '无电梯对老人日常行动是结构性挑战，扶手、防滑条等措施只能降低风险而无法消除。如果老人身体状况对 stairs 敏感，考虑有电梯的房源可能是更安全的选择。',
        severity: 'medium',
      };
    }
  }

  // 4. 同住协商建议：情侣 + 合租 + 朋友
  if (primaryGoal === 'couple' && isShared && roommateSituation === 'friends') {
    return {
      type: 'shared_coordination',
      title: '同住协商建议',
      message: '与朋友合租时，建议优先通过友好沟通明确公共区域使用规则、隐私边界和访客安排；如果边界仍不清晰，再考虑增加隔断等物理改善措施。',
      severity: 'low',
    };
  }

  return undefined;
}
