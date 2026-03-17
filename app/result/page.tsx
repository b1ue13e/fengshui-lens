/**
 * Result Page - 评估结果展示
 * 
 * 数据来源：
 * 1. /analyze 页面跳转（localStorage）
 * 2. /evaluate 表单提交
 * 3. 直接访问（展示示例数据）
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { evaluate } from '@/lib/engine';
import { DecisionNoteCard } from '@/components/ui/decision-note';
import { FeedbackMicro } from '@/components/ui/feedback-micro';
import { 
  ArrowLeft,
  ArrowRight,
  Home,
  Maximize2,
  Wind,
  Sun,
  Eye,
  Layout,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Share2,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// 示例数据（直接访问时展示）
const EXAMPLE_DATA = {
  url: 'https://example.com/listing/123',
  scrapedData: {
    title: '示例房源',
    floorInfo: '中楼层/共18层',
    areaInfo: '45㎡',
    orientation: '南',
    tags: ['近地铁', '精装'],
  },
  evaluation: {
    verdict: 'cautious' as const,
    overallScore: 72,
    risks: [
      { id: '1', title: '临街噪音', severity: 'medium', description: '临主干道', modernReason: '影响睡眠' },
    ],
    actions: [
      { code: 'seal', title: '安装密封条', subtitle: '隔音降噪', costRange: '200-500元', expectedBenefit: { score: 8 } },
    ],
    decisionNote: {
      type: 'structural_defect' as const,
      title: '结构性缺陷提示',
      message: '临街噪音对睡眠场景影响较大，低成本改造只能缓解。',
      severity: 'medium' as const,
    },
    dimensions: [
      { dimension: 'noise', score: 65, weight: 1.3 },
      { dimension: 'lighting', score: 80, weight: 1 },
      { dimension: 'privacy', score: 75, weight: 1.1 },
    ],
  },
  goal: 'sleep_quality',
};

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 尝试从 localStorage 读取评估数据
    const stored = localStorage.getItem('spacerisk_last_evaluation');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch (e) {
        console.error('Failed to parse stored evaluation:', e);
        setData(EXAMPLE_DATA);
      }
    } else {
      setData(EXAMPLE_DATA);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone-400">加载中...</div>
      </div>
    );
  }

  const { evaluation, scrapedData, url, goal } = data || EXAMPLE_DATA;
  const isExample = !localStorage.getItem('spacerisk_last_evaluation');

  // Verdict 配置
  const verdictConfig = {
    rent: { 
      label: '值得租', 
      color: 'bg-emerald-600',
      textColor: 'text-emerald-900',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: CheckCircle2,
      desc: '整体条件良好，适合入住'
    },
    cautious: { 
      label: '谨慎考虑', 
      color: 'bg-amber-500',
      textColor: 'text-amber-900',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: AlertCircle,
      desc: '有明显问题需要关注，建议实地确认'
    },
    avoid: { 
      label: '不建议租', 
      color: 'bg-red-600',
      textColor: 'text-red-900',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertCircle,
      desc: '存在难以改善的严重问题'
    },
  };

  const config = verdictConfig[evaluation.verdict as keyof typeof verdictConfig];
  const VerdictIcon = config.icon;

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/analyze">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>
          
          {isExample && (
            <Badge variant="outline" className="text-stone-400">
              示例数据
            </Badge>
          )}
        </div>

        {/* 核心判定 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${config.color} rounded-2xl p-6 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">综合评估</p>
              <h1 className="text-3xl font-bold">{config.label}</h1>
              <p className="text-white/90 mt-2">{config.desc}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{evaluation.overallScore}</div>
              <div className="text-white/70 text-sm">/100</div>
            </div>
          </div>
        </motion.div>

        {/* Decision Note */}
        {evaluation.decisionNote && (
          <DecisionNoteCard note={evaluation.decisionNote} />
        )}

        {/* 房源信息 */}
        {scrapedData && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
                <Home className="h-4 w-4" />
                房源信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {scrapedData.title && (
                  <p className="font-medium text-stone-900">{scrapedData.title}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-600">
                  {scrapedData.floorInfo && <span>{scrapedData.floorInfo}</span>}
                  {scrapedData.areaInfo && <span>{scrapedData.areaInfo}</span>}
                  {scrapedData.orientation && <span>{scrapedData.orientation}</span>}
                </div>
                {scrapedData.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {scrapedData.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 风险提示 */}
        {evaluation.risks?.length > 0 && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                需要关注的问题 ({evaluation.risks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.risks.map((risk: any, i: number) => (
                <div 
                  key={i}
                  className={`p-4 rounded-xl border ${
                    risk.severity === 'high' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-stone-900">{risk.title}</span>
                    <Badge 
                      variant="outline" 
                      className={risk.severity === 'high' ? 'text-red-700' : 'text-amber-700'}
                    >
                      {risk.severity === 'high' ? '严重' : '中等'}
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-600">{risk.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 改善建议 */}
        {evaluation.actions?.length > 0 && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                优先改善方案
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.actions.map((action: any, i: number) => (
                <div 
                  key={i}
                  className="p-4 rounded-xl border bg-white border-stone-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-stone-900">{action.title}</span>
                    <Badge variant="outline">{action.costRange}</Badge>
                  </div>
                  <p className="text-sm text-stone-600">{action.subtitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 反馈收集 */}
        {!isExample && evaluation.verdict === 'cautious' && (
          <FeedbackMicro 
            logId={url || 'unknown'}
            topRiskTitle={evaluation.risks?.[0]?.title}
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Link href="/analyze" className="flex-1">
            <Button variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              评估另一套
            </Button>
          </Link>
          <Button className="flex-1 bg-stone-800 hover:bg-stone-900">
            <Share2 className="mr-2 h-4 w-4" />
            分享报告
          </Button>
        </div>

        {/* 说明 */}
        <p className="text-center text-sm text-stone-400">
          SpaceRisk 保守策略版 · 当前验证案例中 verdict 表现稳定
        </p>
      </div>
    </div>
  );
}
