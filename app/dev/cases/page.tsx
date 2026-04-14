"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getAllCases, 
  getValidationStats, 
  getCaseById 
} from "@/lib/validation/fixtures";
import { analyzeCase, generateRuleSuggestions } from "@/lib/validation/analyzer";
import { ValidationCase } from "@/lib/validation/types";
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowLeft,
  BarChart3,
  AlertCircle
} from "lucide-react";

const statusConfig = {
  pending: { label: "待验证", color: "bg-stone-100 text-stone-700", icon: HelpCircle },
  validated: { label: "已验证", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  disputed: { label: "有争议", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  confirmed: { label: "已确认", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
};

const verdictConfig = {
  rent: { label: "值得租", color: "bg-green-100 text-green-800" },
  cautious: { label: "谨慎考虑", color: "bg-amber-100 text-amber-800" },
  avoid: { label: "不建议租", color: "bg-red-100 text-red-800" },
};

// 案例列表项
function CaseListItem({ 
  caseData, 
  isSelected, 
  onClick 
}: { 
  caseData: ValidationCase; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const status = statusConfig[caseData.status];
  const StatusIcon = status.icon;
  const comparison = analyzeCase(caseData);
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        isSelected 
          ? "border-stone-900 bg-stone-50" 
          : "border-stone-200 hover:border-stone-300 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{caseData.name}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{caseData.location}</p>
        </div>
        <Badge className={status.color}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 mt-3">
        <Badge variant="outline" className="text-xs">
          {caseData.scenario}
        </Badge>
        {!comparison.verdictMatch && (
          <Badge className="bg-red-100 text-red-700 text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            verdict 不一致
          </Badge>
        )}
      </div>
    </button>
  );
}

// 案例详情面板（人工校验面板）
function CaseDetailPanel({ caseData }: { caseData: ValidationCase }) {
  const comparison = analyzeCase(caseData);
  const systemVerdict = verdictConfig[caseData.systemResult.verdict];
  const humanVerdict = verdictConfig[caseData.humanExpectation.verdict];
  
  return (
    <div className="space-y-6">
      {/* 标题区 */}
      <div>
        <h2 className="text-xl font-bold text-stone-900">{caseData.name}</h2>
        <p className="text-stone-600">{caseData.location}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {caseData.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* 对比概览 */}
      <Card className={comparison.verdictMatch ? "border-green-200" : "border-red-200"}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {comparison.verdictMatch ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                判断一致
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-600" />
                判断存在分歧
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verdict 对比 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 rounded-lg">
              <div className="text-xs text-stone-500 mb-1">系统判断</div>
              <Badge className={systemVerdict.color}>{systemVerdict.label}</Badge>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg">
              <div className="text-xs text-stone-500 mb-1">人工预期</div>
              <Badge className={humanVerdict.color}>{humanVerdict.label}</Badge>
              <div className="text-xs text-stone-400 mt-1">
                确定性：{caseData.humanExpectation.confidence === 'high' ? '高' : 
                        caseData.humanExpectation.confidence === 'medium' ? '中' : '低'}
              </div>
            </div>
          </div>
          
          {/* 差异提示 */}
          {!comparison.verdictMatch && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800 font-medium mb-1">⚠️ Verdict 不一致</div>
              <p className="text-sm text-red-700">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                系统判定"{systemVerdict.label}"，但人工经验建议"{humanVerdict.label}"。
                需要检查规则逻辑或该案例的特殊情况。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Risk 对比 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Risk 对比</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500 mb-1">系统识别</div>
            <div className="font-medium text-stone-900">
              {caseData.systemResult.risks[0]?.title || '无风险'}
            </div>
            <div className="text-sm text-stone-600 mt-1">
              {caseData.systemResult.risks[0]?.description}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500 mb-1">人工直觉</div>
            <div className="font-medium text-stone-900">
              {caseData.humanExpectation.topRiskGuess}
            </div>
          </div>
          {!comparison.topRiskAligned && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm text-amber-800">
                ⚠️ 系统识别的风险与人工直觉有偏差
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* First Action 对比 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">First Action 对比</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500 mb-1">系统推荐</div>
            <div className="font-medium text-stone-900">
              {caseData.systemResult.actions[0]?.title || '无建议'}
            </div>
            <div className="text-sm text-stone-600 mt-1">
              {caseData.systemResult.actions[0]?.subtitle}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg">
            <div className="text-xs text-stone-500 mb-1">人工预期</div>
            <div className="font-medium text-stone-900">
              {caseData.humanExpectation.firstActionGuess}
            </div>
          </div>
          {!comparison.actionReasonable && caseData.humanExpectation.confidence !== 'low' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm text-amber-800">
                ⚠️ 系统推荐的 action 与人工预期不符
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 人工备注 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">人工备注</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{caseData.notes}</p>
        </CardContent>
      </Card>

      {/* 分析详情 */}
      {comparison.issues.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-700">发现的问题</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {comparison.issues.map((issue, i) => (
                <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 统计面板
function StatsPanel() {
  const stats = getValidationStats();
  const suggestions = generateRuleSuggestions(getAllCases());
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            验证统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-stone-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-stone-900">{stats.totalCases}</div>
              <div className="text-xs text-stone-500">总案例</div>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.confirmedCases}</div>
              <div className="text-xs text-stone-500">已确认</div>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.disputedCases}</div>
              <div className="text-xs text-stone-500">有争议</div>
            </div>
            <div className="p-3 bg-stone-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.verdictMatchRate}%</div>
              <div className="text-xs text-stone-500">Verdict 一致率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-800">规则优化建议</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                  <span className="text-amber-500">💡</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ValidationCasesPage() {
  const cases = getAllCases();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(cases[0]?.id || null);
  const [filter, setFilter] = useState<'all' | 'disputed' | 'confirmed'>('all');
  
  const selectedCase = selectedCaseId ? getCaseById(selectedCaseId) : null;
  
  const filteredCases = cases.filter(c => {
    if (filter === 'disputed') return c.status === 'disputed';
    if (filter === 'confirmed') return c.status === 'confirmed';
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-stone-500 hover:text-stone-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <span className="font-semibold text-stone-900">真实房源验证台</span>
              <span className="text-stone-400 mx-2">/</span>
              <span className="text-stone-500 text-sm">内部工具</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {cases.length} 套案例
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：案例列表 */}
          <div className="lg:col-span-4 space-y-4">
            {/* 筛选器 */}
            <div className="flex gap-2">
              {(['all', 'disputed', 'confirmed'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? '全部' : f === 'disputed' ? '有争议' : '已确认'}
                </Button>
              ))}
            </div>
            
            {/* 案例列表 */}
            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {filteredCases.map((caseData) => (
                <CaseListItem
                  key={caseData.id}
                  caseData={caseData}
                  isSelected={selectedCaseId === caseData.id}
                  onClick={() => setSelectedCaseId(caseData.id)}
                />
              ))}
              {filteredCases.length === 0 && (
                <p className="text-center text-stone-500 py-8">暂无案例</p>
              )}
            </div>
          </div>

          {/* 中间：案例详情 */}
          <div className="lg:col-span-5">
            {selectedCase ? (
              <CaseDetailPanel caseData={selectedCase} />
            ) : (
              <div className="flex items-center justify-center h-64 text-stone-500">
                选择左侧案例查看详情
              </div>
            )}
          </div>

          {/* 右侧：统计 */}
          <div className="lg:col-span-3">
            <StatsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
