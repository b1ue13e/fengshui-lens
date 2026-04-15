'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ClipboardList, Home, Lightbulb, RotateCcw, Share2 } from 'lucide-react';
import { DecisionNoteCard } from '@/components/ui/decision-note';
import { FeedbackMicro } from '@/components/ui/feedback-micro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EngineResult, PrimaryGoal } from "@/lib/rent-tools/types";

interface ScrapedListingPreview {
  title?: string;
  floorInfo?: string;
  areaInfo?: string;
  orientation?: string;
  tags?: string[];
}

interface StoredEvaluation extends EngineResult {
  _meta?: {
    confidence?: 'high' | 'medium' | 'low';
  };
}

interface ResultPageData {
  url: string;
  scrapedData?: ScrapedListingPreview;
  evaluation: StoredEvaluation;
  goal: PrimaryGoal;
  shadowLogId?: string;
  isExample: boolean;
}

const EXAMPLE_DATA: ResultPageData = {
  url: 'https://example.com/listing/123',
  scrapedData: {
    title: '示例房源',
    floorInfo: '中楼层 / 共18层',
    areaInfo: '45㎡',
    orientation: '南',
    tags: ['近地铁', '精装'],
  },
  evaluation: {
    verdict: 'cautious',
    overallScore: 72,
    scores: {
      lighting: 80,
      noise: 65,
      dampness: 73,
      privacy: 75,
      circulation: 70,
      focus: 68,
    },
    dimensions: [
      { dimension: 'noise', score: 65, weight: 1.3, factors: [] },
      { dimension: 'lighting', score: 80, weight: 1, factors: [] },
      { dimension: 'privacy', score: 75, weight: 1.1, factors: [] },
    ],
    risks: [
      {
        id: 'demo-risk',
        title: '临街噪音',
        severity: 'medium',
        dimension: 'noise',
        description: '卧室靠近主干道，高峰时段噪音可能偏大。',
        modernReason: '会影响睡眠与专注度',
      },
    ],
    actions: [
      {
        code: 'seal-window',
        title: '补强窗缝密封',
        subtitle: '优先降低外部噪音渗透',
        description: '通过密封条和厚窗帘先做低成本降噪。',
        costLevel: 'low',
        costRange: '200-500元',
        difficulty: 'easy',
        timeRequired: '半天内',
        requirements: {
          needsBuyMaterials: true,
          needsFurnitureMove: false,
          needsLightRenovation: false,
        },
        expectedBenefit: {
          description: '可缓解一部分交通噪音',
          score: 8,
        },
        targetsRisks: ['demo-risk'],
        priorityReason: '先解决最影响居住体验的问题',
      },
    ],
    decisionNote: {
      type: 'structural_defect',
      title: '需要实地确认噪音上限',
      message: '如果晚高峰或夜间噪音明显，这类问题通常很难彻底解决。',
      severity: 'medium',
    },
    _meta: {
      confidence: 'medium',
    },
  },
  goal: 'sleep_quality',
  isExample: true,
};

function loadInitialData(): ResultPageData {
  if (typeof window === 'undefined') {
    return EXAMPLE_DATA;
  }

  const stored =
    localStorage.getItem('young-study_rent_tool_last_evaluation') ??
    localStorage.getItem('spacerisk_last_evaluation');
  if (!stored) {
    return EXAMPLE_DATA;
  }

  try {
    const parsed = JSON.parse(stored) as Omit<ResultPageData, 'isExample'>;
    return {
      ...parsed,
      isExample: false,
    };
  } catch (error) {
    console.error('Failed to parse stored evaluation:', error);
    return EXAMPLE_DATA;
  }
}

const verdictConfig = {
  rent: {
    label: '可以继续了解',
    color: 'bg-emerald-600',
    desc: '整体条件比较稳，可以继续核验合同、价格和细节。',
  },
  cautious: {
    label: '带着问题再核验',
    color: 'bg-amber-500',
    desc: '有明显问题需要确认或补救，再决定是否继续推进。',
  },
  avoid: {
    label: '先别急着租',
    color: 'bg-red-600',
    desc: '存在较难修复的关键短板，新手继续投入时间的性价比不高。',
  },
} satisfies Record<EngineResult['verdict'], { label: string; color: string; desc: string }>;

const goalLabelMap: Record<PrimaryGoal, string> = {
  sleep_quality: '睡眠质量优先',
  exam_prep: '备考学习',
  wfh: '居家办公',
  couple: '情侣同住',
  elderly_safety: '老人居住',
};

function getReplayChecklist(evaluation: StoredEvaluation) {
  const risks = evaluation.risks.slice(0, 3);

  if (risks.length === 0) {
    return [
      '到现场先复核采光和噪声，确认房源文案和真实体验一致。',
      '再看租金、合同条款和入住细节，不要只因为第一眼顺眼就直接决定。',
      '如果现场体验稳定，这类房可以继续深入了解。',
    ];
  }

  return risks.map((risk, index) => {
    if (index === 0) {
      return `先确认「${risk.title}」，这是这次最需要优先排查的问题。`;
    }

    if (index === 1) {
      return `再确认「${risk.title}」，避免只盯着一个问题而忽略第二个短板。`;
    }

    return `最后再判断「${risk.title}」是否在你的容忍范围内。`;
  });
}

export default function ResultPage() {
  const [data] = useState<ResultPageData>(loadInitialData);
  const { evaluation, scrapedData, shadowLogId, isExample, goal } = data;
  const config = verdictConfig[evaluation.verdict];

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/rent/tools/analyze">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </Link>

          {isExample && (
            <Badge variant="outline" className="text-stone-500">
              示例数据
            </Badge>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${config.color} rounded-2xl p-6 text-white`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm mb-1">新手速读结果</p>
              <h1 className="text-3xl font-bold">{config.label}</h1>
              <p className="text-white/90 mt-2">{config.desc}</p>
              <p className="text-white/75 mt-3 text-sm">当前按「{goalLabelMap[goal]}」这个目标来判断。</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{evaluation.overallScore}</div>
              <div className="text-white/70 text-sm">/100</div>
            </div>
          </div>
        </motion.div>

        {evaluation.decisionNote && <DecisionNoteCard note={evaluation.decisionNote} />}

        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              这次看房先做这几步
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getReplayChecklist(evaluation).map((item, index) => (
              <div key={item} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-7 text-stone-700">{item}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {scrapedData && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
                <Home className="h-4 w-4" />
                房源信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {scrapedData.title && <p className="font-medium text-stone-900">{scrapedData.title}</p>}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-600">
                {scrapedData.floorInfo && <span>{scrapedData.floorInfo}</span>}
                {scrapedData.areaInfo && <span>{scrapedData.areaInfo}</span>}
                {scrapedData.orientation && <span>{scrapedData.orientation}</span>}
              </div>
              {scrapedData.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {scrapedData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {evaluation.risks.length > 0 && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                需要关注的问题
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.risks.map((risk) => (
                <div
                  key={risk.id}
                  className={`p-4 rounded-xl border ${
                    risk.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-medium text-stone-900">{risk.title}</span>
                    <Badge variant="outline" className={risk.severity === 'high' ? 'text-red-700' : 'text-amber-700'}>
                      {risk.severity === 'high' ? '高' : '中'}
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-600">{risk.description}</p>
                  {risk.modernReason ? (
                    <p className="mt-2 text-sm text-stone-700">
                      <span className="font-medium">为什么要复核：</span>
                      {risk.modernReason}
                    </p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {evaluation.actions.length > 0 && (
          <Card className="border-stone-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium text-stone-700 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                优先改善建议
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.actions.map((action) => (
                <div key={action.code} className="p-4 rounded-xl border bg-white border-stone-200">
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="font-medium text-stone-900">{action.title}</span>
                    <Badge variant="outline">{action.costRange}</Badge>
                  </div>
                  <p className="text-sm text-stone-600">{action.subtitle}</p>
                  <p className="mt-2 text-sm text-stone-700">
                    <span className="font-medium">为什么现在做：</span>
                    {action.priorityReason}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {!isExample && shadowLogId && evaluation.verdict === 'cautious' && (
          <FeedbackMicro logId={shadowLogId} topRiskTitle={evaluation.risks[0]?.title} />
        )}

        <div className="flex gap-3 pt-4">
          <Link href="/rent/tools/analyze" className="flex-1">
            <Button variant="outline" className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              再评估一套
            </Button>
          </Link>
          <Button className="flex-1 bg-stone-800 hover:bg-stone-900">
            <Share2 className="mr-2 h-4 w-4" />
            分享报告
          </Button>
        </div>

        <p className="text-center text-sm text-stone-400">
          这页更像一张新手租房复盘卡，建议你把它带去现场继续核验，而不是只盯着最终结论。
        </p>
      </div>
    </div>
  );
}
