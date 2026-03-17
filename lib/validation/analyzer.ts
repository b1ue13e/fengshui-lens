// 案例对比分析工具
// 用于分析系统判断 vs 人工预期的差异

import { ValidationCase, CaseComparison, ValidationStats } from "./types";

// 分析单个案例
export function analyzeCase(caseData: ValidationCase): CaseComparison {
  const issues: string[] = [];
  
  // 1. 检查 verdict 是否一致
  const verdictMatch = caseData.systemResult.verdict === caseData.humanExpectation.verdict;
  if (!verdictMatch) {
    issues.push(`verdict 不一致：系统判定"${caseData.systemResult.verdict}"，人工预期"${caseData.humanExpectation.verdict}"`);
  }
  
  // 2. 检查 top risk 是否符合直觉
  // 如果系统识别的 top risk 与人工猜测差异较大，视为偏离
  const systemTopRisk = caseData.systemResult.risks[0]?.title || '无';
  const humanTopRiskGuess = caseData.humanExpectation.topRiskGuess;
  // 简化判断：如果人工明确提到了系统识别的问题，视为符合
  const topRiskAligned = humanTopRiskGuess.toLowerCase().includes(systemTopRisk.toLowerCase().slice(0, 4)) ||
                         systemTopRisk.toLowerCase().includes(humanTopRiskGuess.toLowerCase().slice(0, 4));
  if (!topRiskAligned) {
    issues.push(`top risk 偏离：系统识别"${systemTopRisk}"，人工直觉"${humanTopRiskGuess}"`);
  }
  
  // 3. 检查 first action 是否合理
  const systemFirstAction = caseData.systemResult.actions[0]?.title || '无';
  const humanActionGuess = caseData.humanExpectation.firstActionGuess;
  const actionReasonable = humanActionGuess.toLowerCase().includes(systemFirstAction.toLowerCase().slice(0, 4)) ||
                          systemFirstAction.toLowerCase().includes(humanActionGuess.toLowerCase().slice(0, 4)) ||
                          caseData.humanExpectation.confidence === 'low'; // 人工不确定时不强制要求一致
  if (!actionReasonable && caseData.humanExpectation.confidence !== 'low') {
    issues.push(`first action 存疑：系统推荐"${systemFirstAction}"，人工预期"${humanActionGuess}"`);
  }
  
  return {
    caseId: caseData.id,
    verdictMatch,
    topRiskAligned,
    actionReasonable,
    issues
  };
}

// 批量分析所有案例
export function analyzeAllCases(cases: ValidationCase[]): CaseComparison[] {
  return cases.map(analyzeCase);
}

// 生成验证统计
export function generateStats(cases: ValidationCase[]): ValidationStats {
  const comparisons = analyzeAllCases(cases);
  const total = cases.length;
  
  if (total === 0) {
    return {
      totalCases: 0,
      verdictMatchRate: 0,
      topRiskAlignedRate: 0,
      actionReasonableRate: 0,
      disputedCases: []
    };
  }
  
  const verdictMatches = comparisons.filter(c => c.verdictMatch).length;
  const topRiskAligned = comparisons.filter(c => c.topRiskAligned).length;
  const actionReasonable = comparisons.filter(c => c.actionReasonable).length;
  const disputedCases = cases
    .filter(c => c.status === 'disputed')
    .map(c => c.id);
  
  return {
    totalCases: total,
    verdictMatchRate: Math.round((verdictMatches / total) * 100),
    topRiskAlignedRate: Math.round((topRiskAligned / total) * 100),
    actionReasonableRate: Math.round((actionReasonable / total) * 100),
    disputedCases
  };
}

// 获取有问题的案例（用于优先修复）
export function getProblematicCases(cases: ValidationCase[]): Array<{
  case: ValidationCase;
  comparison: CaseComparison;
  severity: 'high' | 'medium' | 'low';
}> {
  const results = cases.map(c => ({
    case: c,
    comparison: analyzeCase(c),
    severity: 'low' as 'high' | 'medium' | 'low'
  }));
  
  // 根据问题数量定级
  results.forEach(r => {
    const issueCount = r.comparison.issues.length;
    if (issueCount >= 2) r.severity = 'high';
    else if (issueCount === 1) r.severity = 'medium';
  });
  
  // 按严重程度排序
  return results.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// 生成规则优化建议
export function generateRuleSuggestions(cases: ValidationCase[]): string[] {
  const suggestions: string[] = [];
  const problematic = getProblematicCases(cases);
  
  // 分析 verdict 不一致的模式
  const verdictMismatches = problematic.filter(p => !p.comparison.verdictMatch);
  if (verdictMismatches.length > 0) {
    const systemRentHumanAvoid = verdictMismatches.filter(
      p => p.case.systemResult.verdict === 'rent' && p.case.humanExpectation.verdict === 'avoid'
    );
    if (systemRentHumanAvoid.length > 1) {
      suggestions.push(`发现 ${systemRentHumanAvoid.length} 个案例系统判定"值得租"但人工建议"避免"，可能存在过度乐观倾向`);
    }
    
    const systemAvoidHumanRent = verdictMismatches.filter(
      p => p.case.systemResult.verdict === 'avoid' && p.case.humanExpectation.verdict === 'rent'
    );
    if (systemAvoidHumanRent.length > 1) {
      suggestions.push(`发现 ${systemAvoidHumanRent.length} 个案例系统判定"避免"但人工认为"值得租"，可能存在过度悲观倾向`);
    }
  }
  
  // 分析特定场景的问题
  const examPrepCases = problematic.filter(p => p.case.scenario === 'exam_prep');
  if (examPrepCases.length > 1) {
    suggestions.push(`备考场景有 ${examPrepCases.length} 个问题案例，建议重点检查噪音权重`);
  }
  
  const elderlyCases = problematic.filter(p => p.case.scenario === 'elderly_safety');
  if (elderlyCases.length > 1) {
    suggestions.push(`老人居住场景有 ${elderlyCases.length} 个问题案例，建议检查动线和安全权重`);
  }
  
  return suggestions;
}
