"use client";

import { EngineResult } from "@/types";
import { AlertCircle, Info } from "lucide-react";

interface UncertaintyAlertsProps {
  report: EngineResult;
}

interface Alert {
  type: 'info' | 'warning';
  title: string;
  message: string;
  suggestion?: string;
}

/**
 * 分析报告中存在的不确定性
 */
function analyzeUncertainty(report: EngineResult): Alert[] {
  const alerts: Alert[] = [];
  
  // 1. 检查维度分数是否过于接近（边界模糊）
  const sortedDims = [...report.dimensions].sort((a, b) => b.score - a.score);
  const topTwoGap = sortedDims[0].score - sortedDims[1].score;
  const bottomTwoGap = sortedDims[sortedDims.length - 2].score - sortedDims[sortedDims.length - 1].score;
  
  if (topTwoGap < 5) {
    alerts.push({
      type: 'info',
      title: '优势维度不明显',
      message: `${sortedDims[0].dimension}和${sortedDims[1].dimension}评分接近，房屋没有特别突出的优势。`,
      suggestion: '建议实地考察时重点感受这两个方面，看哪个对你更重要。'
    });
  }
  
  if (bottomTwoGap < 5) {
    alerts.push({
      type: 'warning',
      title: '多个维度同时较弱',
      message: `${sortedDims[sortedDims.length - 1].dimension}和${sortedDims[sortedDims.length - 2].dimension}都是明显短板。`,
      suggestion: '这两个问题可能需要同时改善，成本较高，建议重新评估预算。'
    });
  }
  
  // 2. 检查 verdict 是否在边界
  if (report.overallScore >= 70 && report.overallScore <= 80) {
    alerts.push({
      type: 'info',
      title: '评分处于临界区间',
      message: `综合评分${report.overallScore}分处于"值得租"和"谨慎考虑"的边界。`,
      suggestion: '最终决策建议结合实地感受，特别是噪音和采光这两个只能现场确认的因素。'
    });
  }
  
  if (report.overallScore >= 50 && report.overallScore <= 60) {
    alerts.push({
      type: 'warning',
      title: '评分处于临界区间',
      message: `综合评分${report.overallScore}分处于"谨慎考虑"和"不建议租"的边界。`,
      suggestion: '如果能有效改善主要问题，可能还有考虑价值；否则建议放弃。'
    });
  }
  
  // 3. 检查风险是否依赖照片才能确认
  const photoDependentRisks = report.risks.filter(r => 
    ['damp_signs', 'window_blocked', 'wall_damp'].includes(r.id)
  );
  
  if (photoDependentRisks.length > 0) {
    alerts.push({
      type: 'info',
      title: '部分判断依赖实地确认',
      message: `${photoDependentRisks.map(r => r.title).join('、')}等问题需要实地查看或照片确认。`,
      suggestion: '建议看房时重点检查这些区域，或要求中介提供照片。'
    });
  }
  
  return alerts;
}

export function UncertaintyAlerts({ report }: UncertaintyAlertsProps) {
  const alerts = analyzeUncertainty(report);
  
  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-green-900">判断置信度高</div>
          <p className="text-sm text-green-800 mt-1">
            基于你提供的完整信息，当前评估结果较为可靠。
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        判断补充说明
      </h3>
      
      {alerts.map((alert, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            alert.type === 'warning' 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
            alert.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
          }`} />
          <div>
            <div className={`font-medium ${
              alert.type === 'warning' ? 'text-amber-900' : 'text-blue-900'
            }`}>
              {alert.title}
            </div>
            <p className={`text-sm mt-1 ${
              alert.type === 'warning' ? 'text-amber-800' : 'text-blue-800'
            }`}>
              {alert.message}
            </p>
            {alert.suggestion && (
              <p className={`text-sm mt-2 ${
                alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
              }`}>
                <span className="font-medium">建议：</span>{alert.suggestion}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
