"use client";

import { useState } from "react";
import { Dimension, EvaluationReport } from "@/lib/rent-tools/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Bug } from "lucide-react";

interface DebugPanelProps {
  report: EvaluationReport;
}

const dimensionNames: Record<Dimension, string> = {
  lighting: "采光",
  noise: "噪音",
  dampness: "潮湿",
  privacy: "隐私",
  circulation: "动线",
  focus: "专注",
};

export function DebugPanel({ report }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="mt-8 border-t-2 border-dashed border-stone-300 pt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2 text-stone-600">
          <Bug className="h-4 w-4" />
          <span className="text-sm font-medium">开发调试视图</span>
          <span className="text-xs text-stone-400">(仅开发环境可见)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-stone-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* 1. 核心结果摘要 */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">核心结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-stone-500">总分:</span>
                  <span className="ml-2 font-mono font-bold">{report.overallScore}</span>
                </div>
                <div>
                  <span className="text-stone-500">Verdict:</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${
                      report.verdict === 'rent' ? 'border-green-500 text-green-700' :
                      report.verdict === 'avoid' ? 'border-red-500 text-red-700' :
                      'border-amber-500 text-amber-700'
                    }`}
                  >
                    {report.verdict}
                  </Badge>
                </div>
                <div>
                  <span className="text-stone-500">风险数:</span>
                  <span className="ml-2 font-mono">{report.risks.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. 六维分数明细 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">六维分数明细</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-1 px-2 text-stone-500 font-medium">维度</th>
                    <th className="text-right py-1 px-2 text-stone-500 font-medium">分数</th>
                    <th className="text-right py-1 px-2 text-stone-500 font-medium">权重</th>
                    <th className="text-left py-1 px-2 text-stone-500 font-medium">影响因素</th>
                  </tr>
                </thead>
                <tbody>
                  {report.dimensions.map((dim) => (
                    <tr key={dim.dimension} className="border-b border-stone-100 last:border-0">
                      <td className="py-1.5 px-2">{dimensionNames[dim.dimension]}</td>
                      <td className="text-right py-1.5 px-2 font-mono">
                        <span className={dim.score < 60 ? 'text-red-600 font-bold' : ''}>
                          {dim.score}
                        </span>
                      </td>
                      <td className="text-right py-1.5 px-2 font-mono text-stone-500">
                        {dim.weight.toFixed(1)}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-stone-500">
                        {dim.factors?.length > 0 ? (
                          <details>
                            <summary className="cursor-pointer hover:text-stone-700">
                              {dim.factors.length} 个因素
                            </summary>
                            <ul className="mt-1 space-y-0.5">
                              {dim.factors.map((f, i) => (
                                <li key={i} className={f.impact < 0 ? 'text-red-600' : 'text-green-600'}>
                                  {f.name}: {f.impact > 0 ? '+' : ''}{f.impact}
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 3. 风险命中 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">风险命中 ({report.risks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.risks.map((risk, i) => (
                  <div 
                    key={risk.id} 
                    className={`p-2 rounded text-sm ${
                      risk.severity === 'high' ? 'bg-red-50 border border-red-200' :
                      risk.severity === 'medium' ? 'bg-amber-50 border border-amber-200' :
                      'bg-stone-50 border border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 font-mono text-xs">#{i + 1}</span>
                      <span className="font-medium">{risk.id}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          risk.severity === 'high' ? 'border-red-400 text-red-700' :
                          risk.severity === 'medium' ? 'border-amber-400 text-amber-700' :
                          'border-stone-400 text-stone-600'
                        }`}
                      >
                        {risk.severity}
                      </Badge>
                      <span className="text-stone-500">→</span>
                      <span className="text-stone-600">{dimensionNames[risk.dimension]}</span>
                    </div>
                    <div className="mt-1 text-xs text-stone-500 pl-6">
                      {risk.title}
                    </div>
                  </div>
                ))}
                {report.risks.length === 0 && (
                  <p className="text-sm text-stone-400 italic">无风险命中</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. 推荐动作排序 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">推荐动作排序 ({report.actions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.actions.map((action, i) => (
                  <div key={action.code} className="p-2 rounded bg-stone-50 border border-stone-200 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 font-mono text-xs">#{i + 1}</span>
                      <span className="font-medium">{action.code}</span>
                      <Badge variant="outline" className="text-xs">{action.costLevel}</Badge>
                      <Badge variant="outline" className="text-xs">{action.difficulty}</Badge>
                      <span className="text-green-600 text-xs">+{action.expectedBenefit.score}分</span>
                    </div>
                    <div className="mt-1 text-xs text-stone-500 pl-6">
                      {action.title} → 针对: {action.targetsRisks.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 5. Verdict 判定路径分析 */}
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Verdict 判定路径分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {/* 根据报告结果反推判定路径 */}
                {report.verdict === 'avoid' && report.risks.some(r => r.severity === 'high') && (
                  <div className="flex items-start gap-2 text-red-700">
                    <span>1.</span>
                    <span>
                      <strong>高危风险命中</strong> → 
                      存在 {report.risks.filter(r => r.severity === 'high').length} 个高风险项，
                      可能触发 fatal combo 或高危覆盖规则
                    </span>
                  </div>
                )}
                
                {report.overallScore < 55 && (
                  <div className="flex items-start gap-2 text-amber-700">
                    <span>{report.verdict === 'avoid' ? '2.' : '1.'}</span>
                    <span>
                      <strong>基础阈值判定</strong> → 
                      总分 {report.overallScore} &lt; 55，低于 cautious 下限
                    </span>
                  </div>
                )}
                
                {report.verdict === 'cautious' && (
                  <div className="flex items-start gap-2 text-amber-700">
                    <span>1.</span>
                    <span>
                      <strong>基础阈值判定</strong> → 
                      总分 {report.overallScore} 在 [55, 75) 区间，
                      且高风险数 ≤ 1
                    </span>
                  </div>
                )}
                
                {report.verdict === 'rent' && (
                  <div className="flex items-start gap-2 text-green-700">
                    <span>1.</span>
                    <span>
                      <strong>基础阈值判定</strong> → 
                      总分 {report.overallScore} ≥ 75 且无高风险
                    </span>
                  </div>
                )}
                
                <div className="flex items-start gap-2 text-stone-600 pt-2 border-t border-stone-200">
                  <span>✓</span>
                  <span>最终结论: <strong>{report.verdict}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 原始数据查看 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">原始报告数据</CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm text-stone-600 hover:text-stone-900">
                  查看完整 JSON
                </summary>
                <pre className="mt-3 p-3 bg-stone-900 text-stone-100 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
