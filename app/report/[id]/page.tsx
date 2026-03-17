"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEvaluation } from "@/app/actions";
import { EvaluationReport, Dimension } from "@/types";
import { DebugPanel } from "./debug-panel";
import { ChatScriptSection } from "./chat-section";
import { UncertaintyAlerts } from "./uncertainty-alerts";
import { FeedbackSection } from "./feedback-section";
import { DecisionNoteCard } from "@/components/ui/decision-note";
import { FeedbackMicro } from "@/components/ui/feedback-micro";
import { 
  Home, 
  Volume2, 
  Droplets, 
  Eye, 
  Route, 
  Brain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  Users,
  TrendingDown
} from "lucide-react";

// 维度配置
const dimensionConfig: Record<Dimension, { 
  label: string; 
  icon: typeof Home; 
  color: string;
  bgColor: string;
}> = {
  lighting: { 
    label: "采光", 
    icon: Home, 
    color: "text-amber-600",
    bgColor: "bg-amber-500"
  },
  noise: { 
    label: "噪音", 
    icon: Volume2, 
    color: "text-blue-600",
    bgColor: "bg-blue-500"
  },
  dampness: { 
    label: "潮湿", 
    icon: Droplets, 
    color: "text-cyan-600",
    bgColor: "bg-cyan-500"
  },
  privacy: { 
    label: "隐私", 
    icon: Eye, 
    color: "text-purple-600",
    bgColor: "bg-purple-500"
  },
  circulation: { 
    label: "动线", 
    icon: Route, 
    color: "text-green-600",
    bgColor: "bg-green-500"
  },
  focus: { 
    label: "专注", 
    icon: Brain, 
    color: "text-indigo-600",
    bgColor: "bg-indigo-500"
  },
};

// Verdict 配置
const verdictConfig = {
  rent: { 
    label: "值得租", 
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    heroBg: "bg-emerald-600",
    icon: CheckCircle2,
    summary: "整体条件良好，适合居住"
  },
  cautious: { 
    label: "谨慎考虑", 
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    heroBg: "bg-amber-500",
    icon: HelpCircle,
    summary: "有明显问题需要关注，建议实地确认"
  },
  avoid: { 
    label: "不建议租", 
    badge: "bg-red-100 text-red-800 border-red-200",
    heroBg: "bg-red-600",
    icon: XCircle,
    summary: "存在难以改善的严重问题"
  },
};

// 生成核心结论
function generateCoreSummary(report: EvaluationReport): string {
  const lowestDims = [...report.dimensions].sort((a, b) => a.score - b.score).slice(0, 2);
  const topRisk = report.risks[0];
  
  if (report.verdict === 'rent') {
    return `这套房整体条件良好，${lowestDims[0] ? dimensionConfig[lowestDims[0].dimension].label + "稍微弱一些" : "各方面比较均衡"}，适合入住。`;
  }
  
  if (report.verdict === 'avoid') {
    const fatalIssue = topRisk ? topRisk.title : "存在严重问题";
    return `${fatalIssue}难以通过低成本方式改善，${lowestDims[0] ? dimensionConfig[lowestDims[0].dimension].label + "评分偏低" : ""}，建议考虑其他房源。`;
  }
  
  const mainIssue = topRisk ? topRisk.title : "有一些需要注意的问题";
  return `${mainIssue}需要关注，${dimensionConfig[lowestDims[0]?.dimension as Dimension]?.label || ""}方面建议优先改善。建议实地查看后再决定。`;
}

// 获取适合度信息
function getSuitabilityInfo(report: EvaluationReport) {
  const scores = report.scores;
  const risks = report.risks;
  
  const goodFor: string[] = [];
  const badFor: string[] = [];
  
  if (scores.noise >= 75 && scores.privacy >= 70) {
    goodFor.push("需要安静环境的人");
  }
  if (scores.noise < 60 || scores.focus < 60) {
    badFor.push("居家办公/备考学习");
  }
  
  if (scores.lighting >= 75 && scores.circulation >= 70) {
    goodFor.push("喜欢明亮通透空间");
  }
  if (scores.dampness < 60) {
    badFor.push("对潮湿敏感的人");
  }
  
  if (scores.privacy >= 75) {
    goodFor.push("情侣/夫妻同住");
  }
  if (risks.some(r => r.id === 'shared_privacy')) {
    badFor.push("注重隐私的合租者");
  }
  
  if (report.verdict === 'rent' && !goodFor.includes("追求性价比的租客")) {
    goodFor.push("追求性价比的租客");
  }
  if (report.verdict === 'avoid' && !badFor.includes("长期稳定居住")) {
    badFor.push("长期稳定居住");
  }
  
  return { goodFor: goodFor.slice(0, 3), badFor: badFor.slice(0, 3) };
}

// 维度评分条组件
function DimensionBar({ 
  dimension, 
  score, 
  maxScore 
}: { 
  dimension: Dimension; 
  score: number; 
  maxScore: number;
}) {
  const config = dimensionConfig[dimension];
  const Icon = config.icon;
  const isWeak = score < 60;
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${isWeak ? 'bg-red-100' : 'bg-stone-100'} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${isWeak ? 'text-red-600' : 'text-stone-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm ${isWeak ? 'text-red-700 font-medium' : 'text-stone-600'}`}>
            {config.label}
          </span>
          <span className={`text-sm font-semibold ${isWeak ? 'text-red-600' : 'text-stone-900'}`}>
            {score}
          </span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${config.bgColor} ${isWeak ? 'opacity-80' : ''}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 风险卡片
function RiskCard({ risk, index }: { risk: EvaluationReport['risks'][0]; index: number }) {
  const isHigh = risk.severity === 'high';
  
  return (
    <div className={`p-4 rounded-xl border ${isHigh ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isHigh ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 text-sm">{risk.title}</h3>
            <Badge 
              variant="outline" 
              className={`text-xs ${isHigh ? 'border-red-300 text-red-700' : 'border-amber-300 text-amber-700'}`}
            >
              {isHigh ? '严重' : '中等'}
            </Badge>
          </div>
          <p className="text-sm text-stone-600 mb-1">{risk.description}</p>
          <p className="text-xs text-stone-500">
            <span className="font-medium">影响：</span>{risk.modernReason}
          </p>
        </div>
      </div>
    </div>
  );
}

// 建议卡片
function ActionCard({ action, index }: { action: EvaluationReport['actions'][0]; index: number }) {
  return (
    <div className="p-4 rounded-xl border bg-white border-stone-200">
      <div className="flex items-start gap-3">
        <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 text-sm">{action.title}</h3>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {action.costRange}
            </Badge>
          </div>
          <p className="text-sm text-stone-600 mb-2">{action.subtitle}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
            <span>难度：{
              action.difficulty === 'easy' ? '简单' : 
              action.difficulty === 'medium' ? '中等' : '复杂'
            }</span>
            <span>耗时：{action.timeRequired}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 解释性内容组件
function ExplainabilitySection({ report }: { report: EvaluationReport }) {
  const [isOpen, setIsOpen] = useState(false);
  const lowestTwo = [...report.dimensions].sort((a, b) => a.score - b.score).slice(0, 2);
  const criticalRisks = report.risks.filter(r => r.severity === 'high').slice(0, 2);
  
  return (
    <Card className="border-stone-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-stone-500" />
          <span className="font-medium text-stone-900">为什么这样判断？</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-stone-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-stone-400" />
        )}
      </button>
      
      {isOpen && (
        <CardContent className="pt-0 pb-4 border-t border-stone-100">
          <div className="space-y-4 pt-4">
            <div>
              <h4 className="text-sm font-medium text-stone-900 mb-2">最需要改善的方面</h4>
              <p className="text-sm text-stone-600">
                {dimensionConfig[lowestTwo[0]?.dimension as Dimension]?.label}（{lowestTwo[0]?.score}分）
                {lowestTwo[1] && ` 和 ${dimensionConfig[lowestTwo[1].dimension]?.label}（${lowestTwo[1].score}分）`}
              </p>
            </div>
            
            {criticalRisks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-900 mb-2">影响结论的关键问题</h4>
                <ul className="space-y-1">
                  {criticalRisks.map((risk, i) => (
                    <li key={i} className="text-sm text-stone-600 flex items-center gap-2">
                      <span className="text-red-500">•</span>
                      {risk.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">
              基于你提供的房屋信息分析得出，仅供参考。
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isShareMode = searchParams.get('mode') === 'share';
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getEvaluation(params.id as string);
      if (data) {
        setReport(data as EvaluationReport);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-stone-900 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-stone-600">加载报告...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600">报告不存在</p>
          <Link href="/evaluate">
            <Button className="mt-4">开始新的评估</Button>
          </Link>
        </div>
      </div>
    );
  }

  const verdict = verdictConfig[report.verdict];
  const VerdictIcon = verdict.icon;
  const coreSummary = generateCoreSummary(report);
  const { goodFor, badFor } = getSuitabilityInfo(report);
  const sortedDimensions = [...report.dimensions].sort((a, b) => b.score - a.score);

  // 分享模式：简洁视图
  if (isShareMode) {
    return (
      <div className="min-h-screen bg-white">
        <main className="max-w-md mx-auto p-6 space-y-5">
          {/* 简洁 Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900">SpaceRisk</span>
              <span className="text-stone-400">|</span>
              <span className="text-sm text-stone-500">房源评估</span>
            </div>
            <span className="text-xs text-stone-400">{new Date().toLocaleDateString('zh-CN')}</span>
          </div>

          {/* Hero - 更紧凑 */}
          <section className={`${verdict.heroBg} rounded-xl p-5 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <VerdictIcon className="h-4 w-4" />
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {verdict.label}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {report.overallScore}<span className="text-base font-normal text-white/70">/100</span>
            </div>
            <p className="text-sm text-white/90">{coreSummary}</p>
          </section>

          {/* Decision Note - 分享模式 */}
          {(report as any).decisionNote && (
            <div className={`p-4 rounded-xl border ${(report as any).decisionNote?.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${(report as any).decisionNote?.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'}`} />
                <div>
                  <h4 className={`font-semibold text-sm ${(report as any).decisionNote?.severity === 'high' ? 'text-orange-900' : 'text-yellow-900'}`}>
                    {(report as any).decisionNote?.title}
                  </h4>
                  <p className={`text-xs mt-1 ${(report as any).decisionNote?.severity === 'high' ? 'text-orange-800' : 'text-yellow-800'}`}>
                    {(report as any).decisionNote?.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 六维评分 - 网格布局 */}
          <section>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">六维评分</h3>
            <div className="grid grid-cols-3 gap-2">
              {sortedDimensions.map((dim) => {
                const config = dimensionConfig[dim.dimension];
                const Icon = config.icon;
                const isWeak = dim.score < 60;
                return (
                  <div key={dim.dimension} className={`p-3 rounded-lg border text-center ${isWeak ? 'bg-red-50 border-red-100' : 'bg-stone-50 border-stone-100'}`}>
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${isWeak ? 'text-red-500' : 'text-stone-500'}`} />
                    <div className={`text-lg font-bold ${isWeak ? 'text-red-600' : 'text-stone-900'}`}>{dim.score}</div>
                    <div className="text-xs text-stone-500">{config.label}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 主要风险 - 只显示第一个 */}
          {report.risks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">主要问题</h3>
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm text-red-900">{report.risks[0].title}</span>
                </div>
                <p className="text-xs text-red-700">{report.risks[0].description}</p>
              </div>
            </section>
          )}

          {/* 首要建议 - 只显示第一个 */}
          {report.actions.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">首要改善</h3>
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-emerald-900">{report.actions[0].title}</span>
                  <Badge variant="outline" className="text-xs">{report.actions[0].costRange}</Badge>
                </div>
                <p className="text-xs text-emerald-700">{report.actions[0].subtitle}</p>
              </div>
            </section>
          )}

          {/* 适合度 - 简化版 */}
          <section className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <div className="text-xs text-emerald-600 mb-1">适合</div>
              <p className="text-sm text-emerald-900">{goodFor[0] || '一般需求'}</p>
            </div>
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <div className="text-xs text-red-600 mb-1">不适合</div>
              <p className="text-sm text-red-900">{badFor[0] || '无特别限制'}</p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-400">扫码获取完整报告 space-risk.vercel.app</p>
          </div>
        </main>
      </div>
    );
  }

  // 正常模式：完整视图
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">SpaceRisk</span>
          </Link>
          <span className="text-stone-400 text-sm">评估报告</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ① Hero 核心结论区 */}
        <section className={`${verdict.heroBg} rounded-2xl p-6 sm:p-8 text-white`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <VerdictIcon className="h-3.5 w-3.5 mr-1" />
                  {verdict.label}
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                综合评分 {report.overallScore}
                <span className="text-lg font-normal text-white/70 ml-1">/100</span>
              </h1>
              <p className="text-white/90 text-sm sm:text-base max-w-md">
                {coreSummary}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <VerdictIcon className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* ② Decision Note - 结构性缺陷提示（核心阻断） */}
        {(report as any).decisionNote && (
          <DecisionNoteCard note={(report as any).decisionNote} />
        )}

        {/* ③ 六维评分 - 紧凑条形图 */}
        <section>
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            六维评分
          </h2>
          <Card className="border-stone-200">
            <CardContent className="p-4 space-y-4">
              {sortedDimensions.map((dim) => (
                <DimensionBar 
                  key={dim.dimension}
                  dimension={dim.dimension}
                  score={dim.score}
                  maxScore={Math.max(...sortedDimensions.map(d => d.score))}
                />
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ③ 风险与建议并排 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top 3 风险 */}
          {report.risks.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                需要关注的 {Math.min(report.risks.length, 3)} 个问题
              </h2>
              <div className="space-y-3">
                {report.risks.slice(0, 3).map((risk, index) => (
                  <RiskCard key={risk.id} risk={risk} index={index} />
                ))}
              </div>
            </section>
          )}

          {/* Top 3 建议 */}
          {report.actions.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                优先改善方案
              </h2>
              <div className="space-y-3">
                {report.actions.slice(0, 3).map((action, index) => (
                  <ActionCard key={action.code} action={action} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ④ 适合度总结 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200">
            <h3 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              适合谁
            </h3>
            <ul className="space-y-1.5">
              {goodFor.length > 0 ? goodFor.map((item, i) => (
                <li key={i} className="text-sm text-emerald-800 flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  {item}
                </li>
              )) : (
                <li className="text-sm text-emerald-800">条件均衡的通用选择</li>
              )}
            </ul>
          </div>
          
          <div className="p-4 rounded-xl border bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              不适合谁
            </h3>
            <ul className="space-y-1.5">
              {badFor.length > 0 ? badFor.map((item, i) => (
                <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  {item}
                </li>
              )) : (
                <li className="text-sm text-red-800">适合大多数人群</li>
              )}
            </ul>
          </div>
        </section>

        {/* ⑤ 沟通话术 */}
        <ChatScriptSection report={report} />

        {/* ⑥ 判断依据 */}
        <ExplainabilitySection report={report} />

        {/* ⑦ 不确定性提示 */}
        <UncertaintyAlerts report={report} />

        {/* ⑧ 用户反馈（轻量微交互） */}
        {report.verdict === 'cautious' && (
          <FeedbackMicro 
            logId={report.id} 
            topRiskTitle={report.risks[0]?.title}
          />
        )}
        
        {/* 详细反馈 */}
        <FeedbackSection reportId={report.id} />

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href="/evaluate" className="flex-1">
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              评估另一套
            </Button>
          </Link>
          <Link href="/compare" className="flex-1">
            <Button className="w-full bg-stone-900 hover:bg-stone-800">
              对比其他房源
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Debug Panel - 仅开发环境 */}
        <DebugPanel report={report} />
      </main>
    </div>
  );
}
