/**
 * Analyze Page - 新手租房链接速读
 * 
 * 战术链路：
 * 1. 用户粘贴房源链接
 * 2. 后端探针抓取 + cheerio 解析
 * 3. Adapter 清洗为标准输入
 * 4. 风险引擎评估
 * 5. 展示结果
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transformRawToEngineInput, type TransformWarning, type TransformConfidence } from '@/lib/adapters/listing-transformer';
import { evaluate } from '@/lib/engine';
import { logEvaluation } from '@/lib/feedback/shadow-logger';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EvaluationInput, EngineResult, PrimaryGoal } from '@/lib/engine/types';
import { 
  Loader2, 
  Link2, 
  AlertTriangle, 
  CheckCircle2, 
  Home,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ScrapedListingData {
  title: string;
  floorInfo?: string;
  areaInfo?: string;
  tags?: string[];
  orientation?: string;
  layout?: string;
  buildingAge?: string;
  hasElevator?: boolean;
}

interface AnalyzeResult extends EngineResult {
  _meta: {
    confidence: TransformConfidence;
    warnings: TransformWarning[];
  };
}

interface StoredResultPayload {
  url: string;
  scrapedData: ScrapedListingData | null;
  evaluation: AnalyzeResult | null;
  goal: PrimaryGoal;
  shadowLogId?: string;
}

interface ExtractListingResponse {
  success: boolean;
  error?: string;
  details?: string;
  data: ScrapedListingData;
}

// 用户目标选项
const GOAL_OPTIONS = [
  { value: 'sleep_quality', label: '睡眠优先', desc: '需要安静环境' },
  { value: 'exam_prep', label: '备考/学习', desc: '需要专注空间' },
  { value: 'wfh', label: '居家办公', desc: '需要办公区域' },
  { value: 'couple', label: '情侣/夫妻', desc: '注重隐私' },
  { value: 'elderly_safety', label: '老人居住', desc: '注重安全便利' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<PrimaryGoal>('sleep_quality');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedListingData | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<AnalyzeResult | null>(null);
  const [shadowLogId, setShadowLogId] = useState<string | undefined>();

  const handleMagicParse = async () => {
    if (!url) return;
    setLoading(true);
    setErrorMsg('');
    setScrapedData(null);
    setEvaluationResult(null);
    setShadowLogId(undefined);

    try {
      // 1. 发射 URL 给后端探针
      const response = await fetch('/api/extract-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      });
      
      const resData = await response.json() as ExtractListingResponse;
      
      if (!resData.success) {
        throw new Error(resData.error || resData.details || '解析失败');
      }

      setScrapedData(resData.data);

      // 2. 拿到脏数据，启动 Adapter 变压器
      const transformResult = transformRawToEngineInput(
        {
          title: resData.data.title,
          floor_info: resData.data.floorInfo || '未知',
          area: resData.data.areaInfo || '0',
          tags: resData.data.tags || [],
          orientation: resData.data.orientation,
          layout: resData.data.layout,
          building_age: resData.data.buildingAge,
          has_elevator: resData.data.hasElevator,
          is_near_main_road: undefined,
        },
        { primaryGoal: selectedGoal }
      );
      
      // 打印 warnings 到控制台（开发调试）
      if (transformResult.warnings.length > 0) {
        console.log('[Adapter] Transform warnings:', transformResult.warnings);
        console.log('[Adapter] Confidence:', transformResult.confidence);
      }

      // 3. 注入风险引擎，生成初步判断
      const evaluationInput = transformResult.input as EvaluationInput;
      const result = evaluate(evaluationInput);
      
      // 4. 显式记录影子日志（外层 orchestration 负责）
      const shadowEntry = logEvaluation(
        evaluationInput, 
        result, 
        'web',
        {
          confidence: transformResult.confidence,
          warningCount: transformResult.warnings.length,
          warnings: transformResult.warnings.map(w => ({
            field: w.field,
            code: w.code,
            severity: w.severity,
          })),
        }
      );
      setShadowLogId(shadowEntry.id);
      
      // 5. 存储结果（包含 confidence 供后续使用）
      setEvaluationResult({
        ...result,
        _meta: {
          confidence: transformResult.confidence,
          warnings: transformResult.warnings,
        },
      });

    } catch (err) {
      if (!(err instanceof Error)) {
        setErrorMsg('瑙ｆ瀽閾捐矾宕╁锛岃妫€鏌ラ摼鎺ユ垨鎵嬪姩杈撳叆');
        return;
      }
      console.error('[Analyze] 链路错误:', err);
      setErrorMsg(err.message || '解析链路崩塌，请检查链接或手动输入');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullReport = () => {
    // 将结果存储到 localStorage 或 state，然后跳转
    const payload: StoredResultPayload = {
      url,
      scrapedData,
      evaluation: evaluationResult,
      goal: selectedGoal,
      shadowLogId,
    };
    localStorage.setItem('young-study_rent_tool_last_evaluation', JSON.stringify(payload));
    router.push('/rent/tools/result');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(143,173,153,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(176,108,73,0.14),transparent_28%)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-10">
        
        {/* Header */}
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/75 px-4 py-2 text-sm text-stone-700 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <span>给第一次租房的人做一次房源速读</span>
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                粘贴房源链接，先学会这套房该怎么看。
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                租房工具会先抓取房源公开信息，再按你的居住目标告诉你哪里可能有风险、哪些要现场核验，以及这套房值不值得继续了解。
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-stone-300/70 bg-white/85 p-5 shadow-[0_18px_60px_rgba(52,57,53,0.08)] backdrop-blur">
            {[
              ['03 分钟内', '完成一轮新手速读'],
              ['先避坑', '优先排除明显坑位'],
              ['能落地', '结果可直接带去看房'],
            ].map(([value, label]) => (
              <div key={value} className="flex items-center justify-between border-b border-stone-200/70 pb-3 last:border-b-0 last:pb-0">
                <span className="text-sm text-stone-500">{label}</span>
                <span className="text-lg font-semibold text-stone-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[32px] border border-stone-300/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(52,57,53,0.08)] backdrop-blur sm:p-8">
            <div className="space-y-3">
              <label className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">你的居住需求</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GOAL_OPTIONS.map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => setSelectedGoal(goal.value as PrimaryGoal)}
                    className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                      selectedGoal === goal.value
                        ? 'border-stone-900 bg-stone-900 text-white shadow-[0_12px_30px_rgba(28,30,28,0.18)]'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-white'
                    }`}
                  >
                    <div className="font-medium text-sm">{goal.label}</div>
                    <div className={`mt-1 text-xs leading-5 ${
                      selectedGoal === goal.value ? 'text-stone-300' : 'text-stone-500'
                    }`}>
                      {goal.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Card className="border-stone-200/80 bg-stone-50/80 shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-stone-700">
                  <Link2 className="h-5 w-5 text-stone-500" />
                  <span className="font-medium">房源链接</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    placeholder="https://bj.lianjia.com/zufang/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-12 border-stone-200 bg-white text-base"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleMagicParse}
                    disabled={loading || !url}
                    className="h-12 bg-stone-900 px-5 hover:bg-stone-800"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    {loading ? '解析中...' : '开始提取重点'}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-600">链家 / 贝壳</Badge>
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-600">房天下</Badge>
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-600">优先读取面积 / 朝向 / 标签</Badge>
                </div>

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-200 bg-red-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-red-800">这次没有顺利提取成功</p>
                        <p className="mt-1 text-sm leading-6 text-red-700">{errorMsg}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 rounded-[32px] border border-stone-300/70 bg-[linear-gradient(180deg,rgba(247,244,239,0.96),rgba(239,234,227,0.92))] p-6 shadow-[0_18px_60px_rgba(68,55,41,0.08)]">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">系统会先看什么</p>
            {[
              ['基础结构', '户型、面积、朝向、楼层决定了这套房最难改的底子。'],
              ['环境风险', '噪音、潮湿、通风和动线会直接影响住进去后的体感。'],
              ['核验重点', '系统会区分哪些问题能补救、哪些必须现场再确认。'],
            ].map(([title, desc], index) => (
              <div key={title} className="grid gap-2 rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-stone-400">0{index + 1}</span>
                  <h2 className="text-base font-semibold text-stone-900">{title}</h2>
                </div>
                <p className="text-sm leading-6 text-stone-600">{desc}</p>
              </div>
            ))}
          </aside>
        </div>

        {/* 提取结果预览 */}
        <AnimatePresence>
          {scrapedData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-stone-200 bg-white/85 shadow-[0_16px_50px_rgba(52,57,53,0.06)]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-stone-800">数据提取成功</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {scrapedData.title && (
                      <div className="col-span-2">
                        <span className="text-stone-500">标题：</span>
                        <span className="text-stone-800">{scrapedData.title}</span>
                      </div>
                    )}
                    {scrapedData.floorInfo && (
                      <div>
                        <span className="text-stone-500">楼层：</span>
                        <span className="text-stone-800">{scrapedData.floorInfo}</span>
                      </div>
                    )}
                    {scrapedData.areaInfo && (
                      <div>
                        <span className="text-stone-500">面积：</span>
                        <span className="text-stone-800">{scrapedData.areaInfo}</span>
                      </div>
                    )}
                    {scrapedData.orientation && (
                      <div>
                        <span className="text-stone-500">朝向：</span>
                        <span className="text-stone-800">{scrapedData.orientation}</span>
                      </div>
                    )}
                    {!!scrapedData.tags?.length && (
                      <div className="col-span-2">
                        <span className="text-stone-500">标签：</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {scrapedData.tags?.slice(0, 5).map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 评估结果快速预览 */}
        <AnimatePresence>
          {evaluationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className={`rounded-[28px] p-6 text-white shadow-[0_20px_70px_rgba(40,40,40,0.12)] ${
                evaluationResult.verdict === 'rent' ? 'bg-emerald-600' :
                evaluationResult.verdict === 'avoid' ? 'bg-red-600' :
                'bg-amber-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">综合评估</p>
                    <h2 className="text-3xl font-bold">
                      {evaluationResult.verdict === 'rent' ? '可以继续了解' :
                       evaluationResult.verdict === 'avoid' ? '先别急着租' :
                       '带着问题再核验'}
                    </h2>
                    <p className="text-white/90 mt-2">
                      综合评分 {evaluationResult.overallScore}/100
                    </p>
                  </div>
                  <div className="text-5xl font-bold opacity-30">
                    {evaluationResult.overallScore}
                  </div>
                </div>
              </div>

              {/* Low Confidence 提示 */}
              {evaluationResult._meta?.confidence === 'low' && (
                <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4">
                  <p className="text-sm text-stone-600">
                    <span className="font-medium">⚠️ 输入数据不完整：</span>
                    当前判断基于不完整或低置信输入生成，补充更准确的房源信息可提升判断稳定性。
                  </p>
                </div>
              )}

              {evaluationResult.decisionNote && (
                <div className={`rounded-2xl border p-4 ${
                  evaluationResult.decisionNote.severity === 'high' 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      evaluationResult.decisionNote.severity === 'high'
                        ? 'text-orange-600'
                        : 'text-yellow-600'
                    }`} />
                    <div>
                      <h4 className={`font-semibold ${
                        evaluationResult.decisionNote.severity === 'high'
                          ? 'text-orange-900'
                          : 'text-yellow-900'
                      }`}>
                        {evaluationResult.decisionNote.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        evaluationResult.decisionNote.severity === 'high'
                          ? 'text-orange-800'
                          : 'text-yellow-800'
                      }`}>
                        {evaluationResult.decisionNote.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleViewFullReport}
                className="w-full bg-stone-800 hover:bg-stone-900"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                查看完整报告
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 说明文字 */}
        <div className="grid gap-2 rounded-[28px] border border-stone-300/70 bg-white/80 px-5 py-4 text-sm text-stone-500 sm:grid-cols-2">
          <p>支持平台：链家、贝壳找房、房天下等主流房产网站。</p>
          <p>如果解析失败，通常是页面结构变化或反爬策略导致，建议改用手动评估。</p>
        </div>
      </div>
    </div>
  );
}
