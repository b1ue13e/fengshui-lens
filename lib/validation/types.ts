// 真实房源验证系统类型定义
// 用于内部验证引擎准确性，不对外暴露

import { EvaluationInput, EngineResult, Verdict, PrimaryGoal } from "@/types";

export interface ValidationCase {
  id: string;
  name: string;                    // 房源名称/描述，如"朝阳区三里屯一居室"
  location?: string;               // 位置信息（可选）
  scenario: PrimaryGoal;           // 评估目标场景
  input: EvaluationInput;          // 原始输入数据
  systemResult: EngineResult;      // 系统评估结果
  humanExpectation: {
    verdict: Verdict;              // 人工预期 verdict
    topRiskGuess: string;          // 人工觉得最大的问题
    firstActionGuess: string;      // 人工觉得最该做的事
    confidence: 'high' | 'medium' | 'low';  // 人工确定性
  };
  notes: string;                   // 人工备注
  status: 'pending' | 'validated' | 'disputed' | 'confirmed';
  tags: string[];                  // 标签，如["临街", "高层", "老小区"]
  createdAt: string;
  updatedAt: string;
}

// 案例对比分析结果
export interface CaseComparison {
  caseId: string;
  verdictMatch: boolean;           // verdict 是否一致
  topRiskAligned: boolean;         // top risk 是否符合直觉
  actionReasonable: boolean;       // first action 是否合理
  issues: string[];                // 发现的问题
}

// 验证统计
export interface ValidationStats {
  totalCases: number;
  verdictMatchRate: number;        // verdict 一致率
  topRiskAlignedRate: number;      // top risk 符合率
  actionReasonableRate: number;    // action 合理率
  disputedCases: string[];         // 有争议的案例ID
}
