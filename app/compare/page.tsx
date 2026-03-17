"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Trophy, 
  AlertTriangle, 
  Lightbulb, 
  Home, 
  Volume2, 
  Droplets, 
  Eye, 
  Route, 
  Brain,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight
} from "lucide-react";
import { EngineResult, Dimension, PrimaryGoal } from "@/types";

// 模拟数据
const mockReportA: EngineResult = {
  scores: { lighting: 85, noise: 70, dampness: 75, privacy: 80, circulation: 75, focus: 78 },
  overallScore: 77,
  dimensions: [
    { dimension: 'lighting', score: 85, weight: 1, factors: [] },
    { dimension: 'noise', score: 70, weight: 1.3, factors: [] },
    { dimension: 'dampness', score: 75, weight: 1, factors: [] },
    { dimension: 'privacy', score: 80, weight: 1.1, factors: [] },
    { dimension: 'circulation', score: 75, weight: 0.8, factors: [] },
    { dimension: 'focus', score: 78, weight: 1.2, factors: [] },
  ],
  risks: [
    { id: 'elevator_noise', severity: 'medium', dimension: 'noise', title: '电梯运行噪音', description: '房间紧邻电梯', modernReason: '可能影响睡眠' }
  ],
  actions: [
    { code: 'white_noise', title: '使用白噪音', subtitle: '改善睡眠', description: '通过播放白噪音或环境音来掩盖电梯运行噪音，改善睡眠', costLevel: 'low', costRange: '100-300元', difficulty: 'easy', timeRequired: '立即', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '缓解噪音影响', score: 5 }, targetsRisks: ['elevator_noise'], priorityReason: '低成本高回报' }
  ],
  verdict: 'rent'
};

const mockReportB: EngineResult = {
  scores: { lighting: 65, noise: 55, dampness: 70, privacy: 75, circulation: 68, focus: 60 },
  overallScore: 65,
  dimensions: [
    { dimension: 'lighting', score: 65, weight: 1, factors: [] },
    { dimension: 'noise', score: 55, weight: 1.3, factors: [] },
    { dimension: 'dampness', score: 70, weight: 1, factors: [] },
    { dimension: 'privacy', score: 75, weight: 1.1, factors: [] },
    { dimension: 'circulation', score: 68, weight: 0.8, factors: [] },
    { dimension: 'focus', score: 60, weight: 1.2, factors: [] },
  ],
  risks: [
    { id: 'street_noise', severity: 'high', dimension: 'noise', title: '临街主干道噪音', description: '卧室临主干道', modernReason: '影响睡眠和专注' },
    { id: 'window_blocked', severity: 'medium', dimension: 'lighting', title: '采光不足', description: '窗外有遮挡', modernReason: '白天需要开灯' }
  ],
  actions: [
    { code: 'seal_strip', title: '安装密封条', subtitle: '隔音降噪', description: '在门窗缝隙安装密封条，有效降低外部噪音传入', costLevel: 'low', costRange: '200-500元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: true }, expectedBenefit: { description: '降低噪音', score: 8 }, targetsRisks: ['street_noise'], priorityReason: '首要问题' },
    { code: 'supplemental_light', title: '补充照明', subtitle: '改善采光', description: '增加落地灯或台灯补充室内光线', costLevel: 'medium', costRange: '300-800元', difficulty: 'easy', timeRequired: '1小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '提升亮度', score: 6 }, targetsRisks: ['window_blocked'], priorityReason: '改善体验' }
  ],
  verdict: 'cautious'
};

const dimensionConfig: Record<Dimension, { label: string; icon: typeof Home; color: string }> = {
  lighting: { label: "采光", icon: Home, color: "bg-amber-500" },
  noise: { label: "噪音", icon: Volume2, color: "bg-blue-500" },
  dampness: { label: "潮湿", icon: Droplets, color: "bg-cyan-500" },
  privacy: { label: "隐私", icon: Eye, color: "bg-purple-500" },
  circulation: { label: "动线", icon: Route, color: "bg-green-500" },
  focus: { label: "专注", icon: Brain, color: "bg-indigo-500" },
};

const verdictConfig = {
  rent: { label: "值得租", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  cautious: { label: "谨慎考虑", color: "bg-amber-100 text-amber-800", icon: AlertTriangle },
  avoid: { label: "不建议租", color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

// 对比卡片组件
function CompareStatCard({ 
  label, 
  valueA, 
  valueB,
  isWinnerA,
  isWinnerB,
  suffix = ""
}: { 
  label: string; 
  valueA: string | number; 
  valueB: string | number;
  isWinnerA?: boolean;
  isWinnerB?: boolean;
  suffix?: string;
}) {
  return (
    <Card className="border-stone-200">
      <CardContent className="p-4">
        <div className="text-xs text-stone-500 mb-3 text-center">{label}</div>
        <div className="flex items-center justify-between">
          <div className={`text-center flex-1 ${isWinnerA ? 'text-emerald-600' : 'text-stone-600'}`}>
            <div className="text-xl font-bold">{valueA}{suffix}</div>
            <div className="text-xs text-stone-400 mt-0.5">房源A</div>
            {isWinnerA && <TrendingUp className="h-4 w-4 mx-auto mt-1 text-emerald-500" />}
          </div>
          <div className="text-stone-300 px-2">
            <Minus className="h-4 w-4" />
          </div>
          <div className={`text-center flex-1 ${isWinnerB ? 'text-emerald-600' : 'text-stone-600'}`}>
            <div className="text-xl font-bold">{valueB}{suffix}</div>
            <div className="text-xs text-stone-400 mt-0.5">房源B</div>
            {isWinnerB && <TrendingUp className="h-4 w-4 mx-auto mt-1 text-emerald-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 维度对比条
function DimensionCompareBar({ 
  dimension, 
  scoreA, 
  scoreB 
}: { 
  dimension: Dimension; 
  scoreA: number; 
  scoreB: number;
}) {
  const config = dimensionConfig[dimension];
  const Icon = config.icon;
  const diff = scoreA - scoreB;
  const isSignificant = Math.abs(diff) > 10;
  
  return (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-4 w-4 text-stone-500" />
        <span className="text-sm font-medium text-stone-900">{config.label}</span>
        {isSignificant && (
          <Badge variant="outline" className="text-xs ml-auto">
            差{Math.abs(diff)}分
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${scoreA > scoreB ? 'text-emerald-600' : 'text-stone-600'}`}>
              {scoreA}
            </span>
            <span className="text-xs text-stone-400">房源A</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-full ${config.color} rounded-full`} style={{ width: `${scoreA}%` }} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${scoreB > scoreA ? 'text-emerald-600' : 'text-stone-600'}`}>
              {scoreB}
            </span>
            <span className="text-xs text-stone-400">房源B</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-full ${config.color} rounded-full opacity-60`} style={{ width: `${scoreB}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 风险差异对比
function RiskCompare({ risksA, risksB }: { risksA: EngineResult['risks']; risksB: EngineResult['risks'] }) {
  const highRisksA = risksA.filter(r => r.severity === 'high').length;
  const highRisksB = risksB.filter(r => r.severity === 'high').length;
  
  return (
    <div className="space-y-3">
      {/* 统计对比 */}
      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-stone-900">{risksA.length}</div>
          <div className="text-xs text-stone-500">房源A风险数</div>
          {highRisksA > 0 && (
            <Badge variant="outline" className="mt-1 text-xs border-red-300 text-red-700">
              {highRisksA}个严重
            </Badge>
          )}
        </div>
        <div className="text-stone-300 px-4">VS</div>
        <div className="text-center flex-1">
          <div className="text-lg font-bold text-stone-900">{risksB.length}</div>
          <div className="text-xs text-stone-500">房源B风险数</div>
          {highRisksB > 0 && (
            <Badge variant="outline" className="mt-1 text-xs border-red-300 text-red-700">
              {highRisksB}个严重
            </Badge>
          )}
        </div>
      </div>
      
      {/* 主要风险 */}
      {risksA.length === 0 && risksB.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-4">两套房均无明显风险</p>
      ) : (
        <div className="space-y-2">
          {risksA.slice(0, 1).map(risk => (
            <div key={risk.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-xs bg-red-100 text-red-700">房源A</Badge>
                <span className="font-medium text-sm text-red-900">{risk.title}</span>
              </div>
              <p className="text-xs text-red-700">{risk.description}</p>
            </div>
          ))}
          {risksB.slice(0, 1).map(risk => (
            <div key={risk.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-xs bg-red-100 text-red-700">房源B</Badge>
                <span className="font-medium text-sm text-red-900">{risk.title}</span>
              </div>
              <p className="text-xs text-red-700">{risk.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 建议差异对比
function ActionCompare({ actionsA, actionsB }: { actionsA: EngineResult['actions']; actionsB: EngineResult['actions'] }) {
  const costA = actionsA.slice(0, 2).reduce((acc, a) => acc + (a.costLevel === 'high' ? 3 : a.costLevel === 'medium' ? 2 : 1), 0);
  const costB = actionsB.slice(0, 2).reduce((acc, a) => acc + (a.costLevel === 'high' ? 3 : a.costLevel === 'medium' ? 2 : 1), 0);
  
  return (
    <div className="space-y-3">
      {/* 改造成本对比 */}
      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
        <div className="text-center flex-1">
          <Badge className={costA <= costB ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
            {costA <= 2 ? '低' : costA <= 4 ? '中' : '高'}
          </Badge>
          <div className="text-xs text-stone-500 mt-1">房源A改造成本</div>
        </div>
        <div className="text-stone-300 px-4">VS</div>
        <div className="text-center flex-1">
          <Badge className={costB <= costA ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
            {costB <= 2 ? '低' : costB <= 4 ? '中' : '高'}
          </Badge>
          <div className="text-xs text-stone-500 mt-1">房源B改造成本</div>
        </div>
      </div>
      
      {/* 优先建议 */}
      <div className="space-y-2">
        {actionsA.slice(0, 1).map(action => (
          <div key={action.code} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="text-xs bg-emerald-100 text-emerald-700">房源A</Badge>
              <span className="font-medium text-sm text-emerald-900">{action.title}</span>
              <Badge variant="outline" className="text-xs ml-auto">{action.costRange}</Badge>
            </div>
            <p className="text-xs text-emerald-700">{action.subtitle}</p>
          </div>
        ))}
        {actionsB.slice(0, 1).map(action => (
          <div key={action.code} className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="text-xs bg-emerald-100 text-emerald-700">房源B</Badge>
              <span className="font-medium text-sm text-emerald-900">{action.title}</span>
              <Badge variant="outline" className="text-xs ml-auto">{action.costRange}</Badge>
            </div>
            <p className="text-xs text-emerald-700">{action.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [reportA] = useState<EngineResult>(mockReportA);
  const [reportB] = useState<EngineResult>(mockReportB);
  const [targetGoal] = useState<PrimaryGoal>('exam_prep');

  // 计算目标匹配分
  const getGoalMatchScore = (report: EngineResult, goal: PrimaryGoal): number => {
    const weights: Record<PrimaryGoal, Record<Dimension, number>> = {
      'sleep_quality': { lighting: 0.9, noise: 1.3, dampness: 1.0, privacy: 1.1, circulation: 0.8, focus: 0.7 },
      'wfh': { lighting: 1.1, noise: 1.2, dampness: 0.9, privacy: 1.0, circulation: 0.9, focus: 1.3 },
      'exam_prep': { lighting: 1.0, noise: 1.3, dampness: 0.9, privacy: 1.1, circulation: 0.8, focus: 1.2 },
      'couple': { lighting: 1.0, noise: 1.0, dampness: 1.0, privacy: 1.2, circulation: 1.0, focus: 0.8 },
      'elderly_safety': { lighting: 1.0, noise: 0.9, dampness: 1.2, privacy: 0.9, circulation: 1.3, focus: 0.7 },
    };
    
    const w = weights[goal];
    let total = 0;
    let weightSum = 0;
    report.dimensions.forEach(d => {
      total += d.score * w[d.dimension];
      weightSum += w[d.dimension];
    });
    return Math.round(total / weightSum);
  };

  const goalScoreA = getGoalMatchScore(reportA, targetGoal);
  const goalScoreB = getGoalMatchScore(reportB, targetGoal);

  // 决策推荐
  const getRecommendation = () => {
    if (reportA.verdict === 'rent' && reportB.verdict !== 'rent') {
      return { winner: 'A', reason: '综合条件明显更优，适合直接选择', confidence: 'high' };
    }
    if (reportB.verdict === 'rent' && reportA.verdict !== 'rent') {
      return { winner: 'B', reason: '综合条件明显更优，适合直接选择', confidence: 'high' };
    }
    if (goalScoreA > goalScoreB + 5) {
      return { winner: 'A', reason: '更符合你的居住目标，改造成本也较低', confidence: 'medium' };
    }
    if (goalScoreB > goalScoreA + 5) {
      return { winner: 'B', reason: '更符合你的居住目标，值得投入改善', confidence: 'medium' };
    }
    return { winner: null, reason: '两套各有优劣，建议实地考察后再决定', confidence: 'low' };
  };

  const recommendation = getRecommendation();
  const verdictA = verdictConfig[reportA.verdict];
  const verdictB = verdictConfig[reportB.verdict];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="text-stone-500 hover:text-stone-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-semibold text-stone-900">房源对比</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ① 推荐结论 - 大幅强化 */}
        {recommendation.winner ? (
          <Card className="bg-emerald-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-emerald-100 mb-1">推荐选择</div>
                  <div className="text-2xl font-bold mb-2">房源 {recommendation.winner}</div>
                  <p className="text-emerald-100">{recommendation.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-amber-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-amber-100 mb-1">难以直接判断</div>
                  <p className="text-amber-100">{recommendation.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ② Verdict 对比 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className={`border-2 ${recommendation.winner === 'A' ? 'border-emerald-300' : 'border-stone-200'}`}>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-stone-500 mb-2">房源 A</div>
              <Badge className={verdictA.color}>
                <verdictA.icon className="h-3.5 w-3.5 mr-1" />
                {verdictA.label}
              </Badge>
            </CardContent>
          </Card>
          <Card className={`border-2 ${recommendation.winner === 'B' ? 'border-emerald-300' : 'border-stone-200'}`}>
            <CardContent className="p-4 text-center">
              <div className="text-xs text-stone-500 mb-2">房源 B</div>
              <Badge className={verdictB.color}>
                <verdictB.icon className="h-3.5 w-3.5 mr-1" />
                {verdictB.label}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* ③ 核心指标对比 */}
        <div className="grid grid-cols-3 gap-3">
          <CompareStatCard 
            label="综合评分" 
            valueA={reportA.overallScore} 
            valueB={reportB.overallScore}
            isWinnerA={reportA.overallScore > reportB.overallScore}
            isWinnerB={reportB.overallScore > reportA.overallScore}
          />
          <CompareStatCard 
            label="目标匹配" 
            valueA={goalScoreA} 
            valueB={goalScoreB}
            isWinnerA={goalScoreA > goalScoreB}
            isWinnerB={goalScoreB > goalScoreA}
          />
          <CompareStatCard 
            label="风险数量" 
            valueA={reportA.risks.length} 
            valueB={reportB.risks.length}
            isWinnerA={reportA.risks.length < reportB.risks.length}
            isWinnerB={reportB.risks.length < reportA.risks.length}
          />
        </div>

        {/* ④ 六维分对比 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              六维分对比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {(Object.keys(dimensionConfig) as Dimension[]).map((dim) => (
                <DimensionCompareBar 
                  key={dim}
                  dimension={dim}
                  scoreA={reportA.scores[dim]}
                  scoreB={reportB.scores[dim]}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ⑤ 风险与建议对比 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                风险对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskCompare risksA={reportA.risks} risksB={reportB.risks} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-700">
                <Lightbulb className="h-4 w-4" />
                改善方案对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActionCompare actionsA={reportA.actions} actionsB={reportB.actions} />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1">
            查看房源 A 完整报告
          </Button>
          <Button variant="outline" className="flex-1">
            查看房源 B 完整报告
          </Button>
        </div>
        
        <Link href="/evaluate">
          <Button className="w-full bg-stone-900 hover:bg-stone-800">
            评估新房源
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </main>
    </div>
  );
}
