/**
 * 聚合指标模块 - 统一影子日志与验证数据，输出 12 个核心指标
 * 
 * 设计原则：
 * - 影子日志提供实时运行数据（Input Quality + Engine Output + User Feedback）
 * - 验证集提供校准基准（Calibration 指标）
 * - 指标 8-10 样本不足时显示 "insufficient"
 */

import { shadowLogs, type ShadowLogEntry } from '../feedback/shadow-logger';
import { validationCases } from '../validation/fixtures';
import { calculateMetrics as calculateValidationMetrics } from '../validation/metrics';

// ===== 12 Metrics Types =====

export interface MetricsSummary {
  // === Input Quality (Real-time from shadow logs) ===
  inputQuality: {
    totalEvaluations: number;        // 1. 总评估次数
    confidenceDistribution: {        // 2. 输入置信度分布
      high: number;
      medium: number;
      low: number;
    };
    avgWarningsPerInput: number;     // 3. 平均每输入警告数
  };

  // === Engine Output (Real-time from shadow logs) ===
  engineOutput: {
    verdictDistribution: {           // 4. 输出 verdict 分布
      pass: number;
      caution: number;
      block: number;
    };
    passByPrimaryGoal: Record<string, number>;  // 5. 按主目标 Pass 比例
    overrideTriggerRate: number;     // 6. 触发 override 比例（来自验证集）
    decisionNoteRate: number;        // 7. 触发 Decision Note 比例
  };

  // === User Feedback (Real-time, with sample size check) ===
  userFeedback: {
    positiveRate: InsufficientMetric<number>;    // 8. 正面反馈率
    negativeRate: InsufficientMetric<number>;    // 9. 负面反馈率
    cautiousNegativeRate: InsufficientMetric<number>;  // 10. 谨慎拒绝负面反馈率
  };

  // === Calibration (Static from validation cases) ===
  calibration: {
    topRiskHitRate: number;          // 11. 首要风险匹配率
    firstActionAcceptableRate: number;  // 12. 首条建议可接受率
  };
}

export type InsufficientMetric<T> = 
  | { status: 'sufficient'; value: T; sampleSize: number }
  | { status: 'insufficient'; sampleSize: number };

const SAMPLE_THRESHOLD = 5;

// ===== Aggregation Functions =====

function calculateConfidenceDistribution(logs: ShadowLogEntry[]) {
  const dist = { high: 0, medium: 0, low: 0 };
  logs.forEach(log => {
    const conf = log.inputQuality?.confidence;
    if (conf) dist[conf]++;
  });
  return dist;
}

function calculateAvgWarnings(logs: ShadowLogEntry[]) {
  const withQuality = logs.filter(l => l.inputQuality !== undefined);
  if (withQuality.length === 0) return 0;
  const total = withQuality.reduce((sum, l) => sum + (l.inputQuality?.warningCount ?? 0), 0);
  return Math.round((total / withQuality.length) * 10) / 10;
}

function calculateVerdictDistribution(logs: ShadowLogEntry[]) {
  const dist = { pass: 0, caution: 0, block: 0 };
  logs.forEach(log => {
    const v = log.result.verdict;
    // 引擎 verdict: 'rent' = pass, 'cautious' = caution, 'avoid' = block
    if (v === 'rent') dist.pass++;
    else if (v === 'cautious') dist.caution++;
    else if (v === 'avoid') dist.block++;
  });
  return dist;
}

function calculatePassByPrimaryGoal(logs: ShadowLogEntry[]) {
  const byGoal: Record<string, { total: number; pass: number }> = {};
  
  logs.forEach(log => {
    const goal = log.input.primaryGoal;
    if (!goal) return;
    
    if (!byGoal[goal]) byGoal[goal] = { total: 0, pass: 0 };
    byGoal[goal].total++;
    if (log.result.verdict === 'rent') byGoal[goal].pass++;
  });

  const result: Record<string, number> = {};
  Object.entries(byGoal).forEach(([goal, stats]) => {
    result[goal] = Math.round((stats.pass / stats.total) * 100);
  });
  return result;
}

function calculateDecisionNoteRate(logs: ShadowLogEntry[]) {
  if (logs.length === 0) return 0;
  const withNote = logs.filter(l => l.result.decisionNote !== undefined).length;
  return Math.round((withNote / logs.length) * 100);
}

function calculateFeedbackRates(logs: ShadowLogEntry[]) {
  const feedbacks = logs.filter(l => l.feedback !== undefined);
  const n = feedbacks.length;
  
  if (n < SAMPLE_THRESHOLD) {
    return {
      positiveRate: { status: 'insufficient' as const, sampleSize: n },
      negativeRate: { status: 'insufficient' as const, sampleSize: n },
      cautiousNegativeRate: { status: 'insufficient' as const, sampleSize: n },
    };
  }

  const positive = feedbacks.filter(f => f.feedback?.isAccurate).length;
  const negative = feedbacks.filter(f => f.feedback && !f.feedback.isAccurate).length;
  
  const cautiousNegativeFeedbacks = feedbacks.filter(f => {
    if (f.feedback?.isAccurate) return false;
    return f.result.verdict === 'cautious' && f.result.decisionNote !== undefined;
  }).length;

  return {
    positiveRate: { 
      status: 'sufficient' as const, 
      value: Math.round((positive / n) * 100),
      sampleSize: n 
    },
    negativeRate: { 
      status: 'sufficient' as const, 
      value: Math.round((negative / n) * 100),
      sampleSize: n 
    },
    cautiousNegativeRate: { 
      status: 'sufficient' as const, 
      value: Math.round((cautiousNegativeFeedbacks / negative) * 100) || 0,
      sampleSize: negative 
    },
  };
}

// ===== Public API =====

export function getMetricsSummary(): MetricsSummary {
  const logs = shadowLogs.getEntries();
  const validationMetrics = calculateValidationMetrics(validationCases);
  const feedbackRates = calculateFeedbackRates(logs);

  return {
    inputQuality: {
      totalEvaluations: logs.length,
      confidenceDistribution: calculateConfidenceDistribution(logs),
      avgWarningsPerInput: calculateAvgWarnings(logs),
    },
    engineOutput: {
      verdictDistribution: calculateVerdictDistribution(logs),
      passByPrimaryGoal: calculatePassByPrimaryGoal(logs),
      overrideTriggerRate: Math.round(validationMetrics.overrideTriggerRate * 100),
      decisionNoteRate: calculateDecisionNoteRate(logs),
    },
    userFeedback: feedbackRates,
    calibration: {
      topRiskHitRate: Math.round(validationMetrics.topRiskHitRate * 100),
      firstActionAcceptableRate: Math.round(validationMetrics.firstActionAcceptableRate * 100),
    },
  };
}

// ===== Serialization for Dashboard =====

export interface MetricsDisplay {
  sections: Array<{
    title: string;
    metrics: Array<{
      label: string;
      value: string;
      detail?: string;
      status?: 'good' | 'warning' | 'neutral' | 'insufficient';
    }>;
  }>;
}

export function formatMetricsForDisplay(summary: MetricsSummary): MetricsDisplay {
  const { inputQuality, engineOutput, userFeedback, calibration } = summary;
  
  const formatRate = (m: InsufficientMetric<number>) => 
    m.status === 'insufficient' ? 'N/A' : `${m.value}%`;

  return {
    sections: [
      {
        title: 'Input Quality',
        metrics: [
          { 
            label: 'Total Evaluations', 
            value: String(inputQuality.totalEvaluations),
            status: inputQuality.totalEvaluations > 10 ? 'good' : 'neutral',
          },
          { 
            label: 'High Confidence', 
            value: String(inputQuality.confidenceDistribution.high),
            detail: `${Math.round(inputQuality.confidenceDistribution.high / Math.max(inputQuality.totalEvaluations, 1) * 100)}%`,
          },
          { 
            label: 'Avg Warnings/Input', 
            value: String(inputQuality.avgWarningsPerInput),
            status: inputQuality.avgWarningsPerInput < 1 ? 'good' : inputQuality.avgWarningsPerInput < 3 ? 'warning' : 'neutral',
          },
        ],
      },
      {
        title: 'Engine Output',
        metrics: [
          { 
            label: 'Pass Rate', 
            value: `${Math.round(engineOutput.verdictDistribution.pass / Math.max(inputQuality.totalEvaluations, 1) * 100)}%`,
          },
          { 
            label: 'Override Trigger Rate', 
            value: `${engineOutput.overrideTriggerRate}%`,
            detail: 'From validation cases',
          },
          { 
            label: 'Decision Note Rate', 
            value: `${engineOutput.decisionNoteRate}%`,
          },
        ],
      },
      {
        title: 'User Feedback',
        metrics: [
          { 
            label: 'Positive Feedback', 
            value: formatRate(userFeedback.positiveRate),
            status: userFeedback.positiveRate.status === 'insufficient' ? 'insufficient' : 
                    (userFeedback.positiveRate as any).value > 70 ? 'good' : 'warning',
          },
          { 
            label: 'Negative Feedback', 
            value: formatRate(userFeedback.negativeRate),
          },
          { 
            label: 'Cautious Negative Rate', 
            value: formatRate(userFeedback.cautiousNegativeRate),
            detail: 'Negative feedback on Caution verdicts',
          },
        ],
      },
      {
        title: 'Calibration',
        metrics: [
          { 
            label: 'Top Risk Hit Rate', 
            value: `${calibration.topRiskHitRate}%`,
            detail: 'From validation cases',
            status: calibration.topRiskHitRate > 60 ? 'good' : 'warning',
          },
          { 
            label: 'First Action Acceptable', 
            value: `${calibration.firstActionAcceptableRate}%`,
            detail: 'From validation cases',
            status: calibration.firstActionAcceptableRate > 70 ? 'good' : 'warning',
          },
        ],
      },
    ],
  };
}
