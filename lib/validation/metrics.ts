// 验证统计指标计算
import { ValidationCase } from './types';
import { analyzeCase } from './analyzer';

export interface ValidationMetrics {
  // 基础统计
  totalCases: number;
  verdictMatchRate: number;
  
  // 新增指标
  topRiskHitRate: number;           // top risk 命中率
  firstActionAcceptableRate: number; // first action 可接受率
  overrideTriggerRate: number;       // override 规则触发率
  overrideHumanAgreementRate: number; // override 后人工一致率
  cautiousRate: number;              // cautious 区间占比
  
  // 关键拆分指标
  nonOverrideAccuracy: number;       // 非 override 案例的主评分体系准确率
  
  // 细分统计
  byScenario: Record<string, {
    count: number;
    verdictMatchRate: number;
    overrideRate: number;
  }>;
  
  // override 分析
  overrideCases: Array<{
    caseId: string;
    scenario: string;
    humanAgreed: boolean;
    reason: string;
  }>;
  
  // 非 override 案例详情
  nonOverrideCases: Array<{
    caseId: string;
    scenario: string;
    systemVerdict: string;
    humanVerdict: string;
    matched: boolean;
    score: number;
  }>;
}

export function calculateMetrics(cases: ValidationCase[]): ValidationMetrics {
  const comparisons = cases.map(c => ({ case: c, comparison: analyzeCase(c) }));
  
  // 基础统计
  const totalCases = cases.length;
  const verdictMatches = comparisons.filter(c => c.comparison.verdictMatch).length;
  
  // top risk 命中率（系统 top risk 与人工猜测一致或高度相关）
  const topRiskHits = comparisons.filter(c => {
    const systemTopRisk = c.case.systemResult.risks[0]?.title || '';
    const humanGuess = c.case.humanExpectation.topRiskGuess;
    // 简化判断：系统风险包含在人工猜测中，或人工猜测包含系统风险
    return humanGuess.toLowerCase().includes(systemTopRisk.toLowerCase().slice(0, 4)) ||
           systemTopRisk.toLowerCase().includes(humanGuess.toLowerCase().slice(0, 4));
  }).length;
  
  // first action 可接受率
  const actionAcceptable = comparisons.filter(c => {
    const systemAction = c.case.systemResult.actions[0]?.title || '';
    const humanGuess = c.case.humanExpectation.firstActionGuess;
    // 简化判断
    return humanGuess.toLowerCase().includes(systemAction.toLowerCase().slice(0, 4)) ||
           systemAction.toLowerCase().includes(humanGuess.toLowerCase().slice(0, 4)) ||
           c.case.humanExpectation.confidence === 'low';
  }).length;
  
  // override 规则触发率（verdict 为 avoid 且存在 high severity risk）
  const overrideCases = cases.filter(c => {
    return c.systemResult.verdict === 'avoid' && 
           c.systemResult.risks.some(r => r.severity === 'high');
  });
  
  // override 后人工一致率
  const overrideHumanAgreed = overrideCases.filter(c => {
    return c.humanExpectation.verdict === 'avoid';
  });
  
  // cautious 区间占比
  const cautiousCases = cases.filter(c => c.systemResult.verdict === 'cautious');
  
  // 按场景统计
  const byScenario: Record<string, { count: number; verdictMatchRate: number; overrideRate: number }> = {};
  const scenarios = [...new Set(cases.map(c => c.scenario))];
  
  for (const scenario of scenarios) {
    const scenarioCases = comparisons.filter(c => c.case.scenario === scenario);
    const scenarioOverrides = scenarioCases.filter(c => 
      c.case.systemResult.verdict === 'avoid' && 
      c.case.systemResult.risks.some(r => r.severity === 'high')
    );
    
    byScenario[scenario] = {
      count: scenarioCases.length,
      verdictMatchRate: scenarioCases.length > 0 
        ? Math.round((scenarioCases.filter(c => c.comparison.verdictMatch).length / scenarioCases.length) * 100)
        : 0,
      overrideRate: scenarioCases.length > 0
        ? Math.round((scenarioOverrides.length / scenarioCases.length) * 100)
        : 0,
    };
  }
  
  // override 案例详情
  const overrideCaseDetails = overrideCases.map(c => ({
    caseId: c.id,
    scenario: c.scenario,
    humanAgreed: c.humanExpectation.verdict === 'avoid',
    reason: c.systemResult.risks.find(r => r.severity === 'high')?.title || '未知',
  }));
  
  // 非 override 案例分析（主评分体系准确率）
  const nonOverrideCasesList = comparisons.filter(c => 
    !(c.case.systemResult.verdict === 'avoid' && 
      c.case.systemResult.risks.some(r => r.severity === 'high'))
  );
  
  const nonOverrideMatches = nonOverrideCasesList.filter(c => c.comparison.verdictMatch);
  
  const nonOverrideCaseDetails = nonOverrideCasesList.map(c => ({
    caseId: c.case.id,
    scenario: c.case.scenario,
    systemVerdict: c.case.systemResult.verdict,
    humanVerdict: c.case.humanExpectation.verdict,
    matched: c.comparison.verdictMatch,
    score: c.case.systemResult.overallScore,
  }));
  
  return {
    totalCases,
    verdictMatchRate: Math.round((verdictMatches / totalCases) * 100),
    topRiskHitRate: Math.round((topRiskHits / totalCases) * 100),
    firstActionAcceptableRate: Math.round((actionAcceptable / totalCases) * 100),
    overrideTriggerRate: Math.round((overrideCases.length / totalCases) * 100),
    overrideHumanAgreementRate: overrideCases.length > 0 
      ? Math.round((overrideHumanAgreed.length / overrideCases.length) * 100)
      : 100,
    cautiousRate: Math.round((cautiousCases.length / totalCases) * 100),
    nonOverrideAccuracy: nonOverrideCasesList.length > 0
      ? Math.round((nonOverrideMatches.length / nonOverrideCasesList.length) * 100)
      : 100,
    byScenario,
    overrideCases: overrideCaseDetails,
    nonOverrideCases: nonOverrideCaseDetails,
  };
}

// 生成指标报告
export function generateMetricsReport(metrics: ValidationMetrics): string {
  const lines: string[] = [];
  
  lines.push('=== SpaceRisk 验证指标报告 ===');
  lines.push('');
  lines.push(`总案例数: ${metrics.totalCases}`);
  lines.push(`Verdict 一致率: ${metrics.verdictMatchRate}%`);
  lines.push(`Top Risk 命中率: ${metrics.topRiskHitRate}%`);
  lines.push(`First Action 可接受率: ${metrics.firstActionAcceptableRate}%`);
  lines.push('');
  lines.push('--- Override 规则分析 ---');
  lines.push(`Override 触发率: ${metrics.overrideTriggerRate}% (目标: <30%)`);
  lines.push(`Override 后人工一致率: ${metrics.overrideHumanAgreementRate}% (目标: >80%)`);
  lines.push(`Cautious 区间占比: ${metrics.cautiousRate}% (目标: 20-40%)`);
  lines.push('');
  lines.push('--- 按场景统计 ---');
  for (const [scenario, data] of Object.entries(metrics.byScenario)) {
    lines.push(`${scenario}: ${data.count}案例, 一致率${data.verdictMatchRate}%, override率${data.overrideRate}%`);
  }
  lines.push('');
  lines.push('--- Override 案例详情 ---');
  for (const oc of metrics.overrideCases) {
    lines.push(`- ${oc.caseId} (${oc.scenario}): ${oc.humanAgreed ? '✅人工同意' : '❌人工异议'} - ${oc.reason}`);
  }
  lines.push('');
  
  lines.push('--- 主评分体系分析（非 Override 案例）---');
  lines.push(`非 Override 案例数: ${metrics.nonOverrideCases.length}`);
  lines.push(`主评分体系准确率: ${metrics.nonOverrideAccuracy}%`);
  lines.push('');
  lines.push('非 Override 案例详情:');
  for (const nc of metrics.nonOverrideCases) {
    const icon = nc.matched ? '✅' : '❌';
    lines.push(`  ${icon} ${nc.caseId} (${nc.scenario}): 系统${nc.systemVerdict} vs 人工${nc.humanVerdict} (分数:${nc.score})`);
  }
  lines.push('');
  
  // 过拟合判断
  lines.push('--- 过拟合风险评估 ---');
  if (metrics.overrideTriggerRate > 30) {
    lines.push('⚠️ Override 触发率过高，系统可能过度依赖特判');
  } else {
    lines.push('✅ Override 触发率在合理范围内');
  }
  
  if (metrics.overrideHumanAgreementRate < 80) {
    lines.push('⚠️ Override 后人工一致率低，特判规则可能不合理');
  } else {
    lines.push('✅ Override 后人工一致率良好');
  }
  
  if (metrics.cautiousRate < 20) {
    lines.push('⚠️ Cautious 区间过窄，中间地带被压缩');
  } else if (metrics.cautiousRate > 40) {
    lines.push('⚠️ Cautious 区间过宽，判断可能过于模糊');
  } else {
    lines.push('✅ Cautious 区间合理');
  }
  
  return lines.join('\n');
}
