/**
 * Verdict 判定规则 - 分层决策体系
 * 
 * 原则：
 * 1. 只有"高危 + 场景相关 + 难以缓解"的组合，才配直接打到 avoid
 * 2. 可缓解性评估基于用户约束和动作收益
 * 3. 避免纯静态名单，考虑实际改善可能性
 */

import { NormalizedInput, PrimaryGoal, RiskItem, Verdict } from './types';

interface VerdictContext {
  score: number;
  risks: RiskItem[];
  input: NormalizedInput;
}

/**
 * 主判定函数
 */
export function calculateVerdict(ctx: VerdictContext): Verdict {
  const { score, risks, input } = ctx;
  
  // 第一步：高危组合检查（考虑可缓解性）
  if (hasUnmitigatableCombo(risks, input)) {
    return 'avoid';
  }
  
  // 第二步：场景致命单点检查
  if (hasFatalSinglePoint(risks, input)) {
    return 'avoid';
  }
  
  // 第三步：基础阈值判定
  const highRisks = risks.filter(r => r.severity === 'high');
  
  if (score >= 75 && highRisks.length === 0) {
    return 'rent';
  }
  if (score >= 55 && highRisks.length <= 1) {
    return 'cautious';
  }
  return 'avoid';
}

/**
 * 难以缓解的高危组合判定
 * 
 * 标准：场景相关 + 多重风险叠加 + 用户约束导致无法有效改善
 */
function hasUnmitigatableCombo(risks: RiskItem[], input: NormalizedInput): boolean {
  const riskCodes = new Set(risks.map(r => r.id));
  const { primaryGoal, allowsSoftImprovements, allowsFurnitureMove, monthlyBudget } = input;
  
  // === 老人场景 ===
  if (primaryGoal === 'elderly_safety') {
    // 低楼层 + 已有潮湿迹象 = 结构性问题，难以根治
    if (input.isLowFloor && riskCodes.has('damp_signs')) {
      return true;
    }
    // 通风差 + 老楼 = 双重结构性缺陷
    if (riskCodes.has('poor_ventilation') && input.buildingAge === 'old') {
      return true;
    }
  }
  
  // === 睡眠场景 ===
  if (primaryGoal === 'sleep_quality') {
    // 临街噪音 + 西晒 + 无法软装改善 = 无法入睡
    if ((riskCodes.has('street_noise_low') || riskCodes.has('street_noise_high')) && riskCodes.has('west_sun_bedroom')) {
      // 如果预算低或不能软装，直接判死刑
      if (monthlyBudget === 'low' || !allowsSoftImprovements) {
        return true;
      }
    }
    // 电梯旁 + 不能移动床位 = 长期噪音暴露
    if (riskCodes.has('elevator_noise') && !allowsFurnitureMove) {
      return true;
    }
  }
  
  // === 备考场景 ===
  if (primaryGoal === 'exam_prep') {
    // 临街噪音 + 无法改善 = 无法专注
    if ((riskCodes.has('street_noise_low') || riskCodes.has('street_noise_high')) && !allowsSoftImprovements) {
      return true;
    }
  }
  
  // === 居家办公场景 ===
  if (primaryGoal === 'wfh') {
    // 无书桌空间 + 不能移动家具 = 无法工作
    if (riskCodes.has('no_desk_space') && !allowsFurnitureMove) {
      return true;
    }
  }
  
  return false;
}

/**
 * 场景致命单点判定
 * 
 * 标准：特定场景下，某些单点风险即使可缓解也直接致命
 */
function hasFatalSinglePoint(risks: RiskItem[], input: NormalizedInput): boolean {
  const highRiskCodes = new Set(
    risks.filter(r => r.severity === 'high').map(r => r.id)
  );
  const { primaryGoal, roommateSituation, floorLevel } = input;
  
  // 老人场景：任何安全相关的高危风险
  if (primaryGoal === 'elderly_safety') {
    const safetyRisks = ['damp_signs', 'ground_floor_damp', 'poor_ventilation'];
    if (safetyRisks.some(code => highRiskCodes.has(code))) {
      return true;
    }
    // 新增：老人 + 无电梯 + 临街 = 安全风险
    if (highRiskCodes.has('no_elevator') && (highRiskCodes.has('street_noise_low') || highRiskCodes.has('street_noise_high'))) {
      return true;
    }
  }
  
  // 睡眠场景：临街主干道（低楼层才致命，高楼层可缓解）
  if (primaryGoal === 'sleep_quality' && highRiskCodes.has('street_noise_low')) {
    // 只有低楼层临街才是致命的
    if (floorLevel === 'low' || floorLevel === 'middle') {
      return true;
    }
    // 高楼层临街可通过改善接受
    return false;
  }
  
  // 备考场景：严重噪音干扰（仅限低中楼层）
  if (primaryGoal === 'exam_prep' && highRiskCodes.has('street_noise_low')) {
    return true;
  }
  
  // 情侣场景：与陌生人合租是隐私硬伤（朋友/熟人可接受）
  if (primaryGoal === 'couple' && highRiskCodes.has('shared_privacy')) {
    // 如果是与朋友/熟人合租，不判avoid
    if (roommateSituation === 'friends' || roommateSituation === 'couple') {
      return false;
    }
    return true;
  }
  
  return false;
}

/**
 * 可缓解性评估（用于报告解释，非 verdict 判定）
 * 
 * 返回每个风险的可缓解等级：
 * - 'easy': 低成本、易操作
 * - 'moderate': 中等成本或需要协调
 * - 'hard': 高成本或结构性问题
 */
export function assessMitigability(
  risk: RiskItem,
  input: NormalizedInput
): 'easy' | 'moderate' | 'hard' {
  const { allowsSoftImprovements, allowsFurnitureMove, allowsLightRenovation, monthlyBudget } = input;
  
  // 结构性问题难以缓解
  if (['ground_floor_damp', 'poor_ventilation'].includes(risk.id)) {
    return 'hard';
  }
  
  // 需要移动家具但用户不允许
  if (['bed_privacy', 'no_desk_space'].includes(risk.id) && !allowsFurnitureMove) {
    return 'hard';
  }
  
  // 需要轻改造但用户不允许
  if (['west_sun_bedroom', 'window_blocked'].includes(risk.id) && !allowsLightRenovation) {
    return allowsSoftImprovements ? 'moderate' : 'hard';
  }
  
  // 噪音类通常可通过软装缓解
  if (['street_noise', 'elevator_noise', 'old_building_noise'].includes(risk.id)) {
    if (!allowsSoftImprovements) return 'hard';
    if (monthlyBudget === 'low') return 'moderate';
    return 'easy';
  }
  
  // 默认：可缓解
  return 'easy';
}
