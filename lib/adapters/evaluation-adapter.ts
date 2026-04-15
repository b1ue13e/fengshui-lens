import { Evaluation } from "@prisma/client";

import {
  Dimension,
  DimensionScore,
  EvaluationReport,
} from "@/lib/rent-tools/types";
import { isVerdict } from "@/lib/rent-tools/constants/evaluation";

/**
 * 数据库模型 → 报告模型的纯格式转换
 * 
 * 原则：
 * 1. 只负责数据形状转换，不做业务逻辑判断
 * 2. 排序、截断、verdict计算应在引擎层完成
 * 3. 使用类型守卫确保数据合法性
 */

interface RawEvaluation extends Evaluation {
  [key: string]: unknown;
}

/**
 * 解析六维分数
 */
function parseScores(db: RawEvaluation): Record<Dimension, number> {
  return {
    lighting: clampScore(db.scoreLighting),
    noise: clampScore(db.scoreNoise),
    dampness: clampScore(db.scoreDampness),
    privacy: clampScore(db.scorePrivacy),
    circulation: clampScore(db.scoreCirculation),
    focus: clampScore(db.scoreFocus),
  };
}

/**
 * 分数限制在 0-100 范围（系统不变量）
 */
function clampScore(score: unknown): number {
  if (typeof score !== 'number' || Number.isNaN(score)) return 70;
  return Math.max(0, Math.min(100, score));
}

/**
 * 构建维度详情数组（保持与引擎输出一致的结构）
 */
function buildDimensions(scores: Record<Dimension, number>): DimensionScore[] {
  const dimensions: Dimension[] = ['lighting', 'noise', 'dampness', 'privacy', 'circulation', 'focus'];
  
  return dimensions.map(dim => ({
    dimension: dim,
    score: scores[dim],
    weight: 1,  // 从DB恢复时权重信息丢失，使用默认值
    factors: [],  // 从DB恢复时因子详情丢失
  }));
}

/**
 * 安全解析 JSON 字段
 */
function safeParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 验证 verdict 值（使用类型守卫）
 */
function validateVerdict(verdict: unknown): 'rent' | 'cautious' | 'avoid' {
  if (typeof verdict === 'string' && isVerdict(verdict)) {
    return verdict;
  }
  // 兼容旧数据的大写格式
  if (verdict === 'RENT') return 'rent';
  if (verdict === 'CAUTIOUS') return 'cautious';
  if (verdict === 'AVOID') return 'avoid';
  return 'cautious';  // 默认值
}

/**
 * 主转换函数：DB Model → EvaluationReport
 */
export function toEvaluationReport(db: RawEvaluation): EvaluationReport {
  const scores = parseScores(db);
  const detectedRisks = safeParse(db.detectedRisks as string, []);
  const recommendedActions = safeParse(db.recommendedActions as string, []);
  const chatScripts = safeParse(db.chatScripts as string, []);
  
  return {
    // 元数据
    id: db.id,
    createdAt: db.createdAt,
    
    // 引擎输出（核心）
    scores,
    overallScore: clampScore(db.scoreOverall),
    dimensions: buildDimensions(scores),
    risks: detectedRisks,
    actions: recommendedActions,
    verdict: validateVerdict(db.verdict),
    
    // 报告专属字段
    summaryText: db.summaryText || '',
    chatScripts,
  };
}

/**
 * 批量转换
 */
export function toEvaluationReports(dbs: RawEvaluation[]): EvaluationReport[] {
  return dbs.map(toEvaluationReport);
}
