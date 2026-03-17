/**
 * Analyze Page - 一键透视真实房源
 * 
 * 战术链路：
 * 1. 用户粘贴房源链接
 * 2. 后端探针抓取 + cheerio 解析
 * 3. Adapter 清洗为标准输入
 * 4. 风水引擎评估
 * 5. 展示结果
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transformRawToEngineInput } from '@/lib/adapters/listing-transformer';
import { evaluate } from '@/lib/engine';
import { logEvaluation } from '@/lib/feedback/shadow-logger';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const [selectedGoal, setSelectedGoal] = useState('sleep_quality');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  const handleMagicParse = async () => {
    if (!url) return;
    setLoading(true);
    setErrorMsg('');
    setScrapedData(null);
    setEvaluationResult(null);

    try {
      // 1. 发射 URL 给后端探针
      const response = await fetch('/api/extract-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      });
      
      const resData = await response.json();
      
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
        { primaryGoal: selectedGoal as any }
      );
      
      // 打印 warnings 到控制台（开发调试）
      if (transformResult.warnings.length > 0) {
        console.log('[Adapter] Transform warnings:', transformResult.warnings);
        console.log('[Adapter] Confidence:', transformResult.confidence);
      }

      // 3. 注入风水引擎，一锤定音
      const result = evaluate(transformResult.input as any);
      
      // 4. 显式记录影子日志（外层 orchestration 负责）
      logEvaluation(
        transformResult.input as any, 
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
      
      // 5. 存储结果（包含 confidence 供后续使用）
      setEvaluationResult({
        ...result,
        _meta: {
          confidence: transformResult.confidence,
          warnings: transformResult.warnings,
        },
      });

    } catch (err: any) {
      console.error('[Analyze] 链路错误:', err);
      setErrorMsg(err.message || '解析链路崩塌，请检查链接或手动输入');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFullReport = () => {
    // 将结果存储到 localStorage 或 state，然后跳转
    localStorage.setItem('spacerisk_last_evaluation', JSON.stringify({
      url,
      scrapedData,
      evaluation: evaluationResult,
      goal: selectedGoal,
    }));
    router.push('/result');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-200 rounded-full text-sm text-stone-700">
            <Sparkles className="h-4 w-4" />
            <span>按需狙击战术</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900">
            一键透视真实房源
          </h1>
          <p className="text-stone-600 max-w-md mx-auto">
            粘贴链家、贝壳找房等房源链接，AI 自动提取关键信息并生成居住风险评估
          </p>
        </div>

        {/* 目标选择 */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-stone-700">你的居住需求</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.value}
                onClick={() => setSelectedGoal(goal.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedGoal === goal.value
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="font-medium text-sm">{goal.label}</div>
                <div className={`text-xs mt-1 ${
                  selectedGoal === goal.value ? 'text-stone-300' : 'text-stone-500'
                }`}>
                  {goal.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* URL 输入 */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-stone-700">
              <Link2 className="h-5 w-5" />
              <span className="font-medium">房源链接</span>
            </div>
            
            <div className="flex gap-3">
              <Input
                placeholder="https://bj.lianjia.com/zufang/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-white"
                disabled={loading}
              />
              <Button
                onClick={handleMagicParse}
                disabled={loading || !url}
                className="bg-stone-800 hover:bg-stone-900"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 mr-2" />
                )}
                {loading ? '解析中...' : '开始评估'}
              </Button>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">解析失败</p>
                  <p className="text-sm text-red-600">{errorMsg}</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* 提取结果预览 */}
        <AnimatePresence>
          {scrapedData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-stone-200 bg-stone-50/50">
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
                    {scrapedData.tags?.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-stone-500">标签：</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {scrapedData.tags.slice(0, 5).map((tag: string, i: number) => (
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
              <div className={`p-6 rounded-2xl text-white ${
                evaluationResult.verdict === 'rent' ? 'bg-emerald-600' :
                evaluationResult.verdict === 'avoid' ? 'bg-red-600' :
                'bg-amber-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">综合评估</p>
                    <h2 className="text-3xl font-bold">
                      {evaluationResult.verdict === 'rent' ? '值得租' :
                       evaluationResult.verdict === 'avoid' ? '不建议租' :
                       '谨慎考虑'}
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
                <div className="p-4 rounded-xl border bg-stone-100 border-stone-200">
                  <p className="text-sm text-stone-600">
                    <span className="font-medium">⚠️ 输入数据不完整：</span>
                    当前判断基于不完整或低置信输入生成，补充更准确的房源信息可提升判断稳定性。
                  </p>
                </div>
              )}

              {evaluationResult.decisionNote && (
                <div className={`p-4 rounded-xl border ${
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
        <div className="text-center text-sm text-stone-500 space-y-1">
          <p>支持平台：链家、贝壳找房等主流房产网站</p>
          <p>如果遇到解析失败，可能是网站结构变更或反爬虫策略，请尝试手动输入</p>
        </div>
      </div>
    </div>
  );
}
