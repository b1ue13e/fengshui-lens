"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Share2,
  Home,
  Maximize2,
  Wind,
  Sun,
  Eye,
  Layout,
  CheckCircle2,
  Lightbulb,
  Clock,
  Calendar,
  FileText,
  Camera,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const reportMetadata = {
  id: "FS-2026-0317-001",
  date: "2026年3月17日",
  roomType: "客厅",
  roomSize: "约 28㎡",
  orientation: "东南朝向",
  floor: "中层（8/18）",
};

const executiveSummary = {
  overallScore: 82,
  rating: "优秀",
  summary:
    "该客厅整体布局合理，空间通透度优秀，自然采光充足。主要优势在于良好的空气流通和清晰的动线规划。建议关注的方面包括：增加多层次照明以提升氛围，微调沙发位置以获得更好的背靠感。",
};

const dimensionAnalysis = [
  {
    id: "layout",
    label: "空间布局",
    score: 85,
    icon: Layout,
    fullAnalysis: [
      "家具摆放遵循功能分区原则，起居区、通行区划分清晰",
      "主要通道宽度充足，日常活动无阻碍",
      "沙发与茶几的距离适中，符合人体工程学",
      "电视位置与沙发形成良好观看角度",
    ],
    suggestions: [
      "考虑将沙发向东移动30cm，增加与窗户的距离",
      "茶几可略向中心移动，使四周通道更均衡",
    ],
  },
  {
    id: "lighting",
    label: "光线条件",
    score: 78,
    icon: Sun,
    fullAnalysis: [
      "东南朝向带来优质的上午自然光",
      "窗户面积与房间比例合理，采光充足",
      "现有窗帘可有效调节光线强度",
      "但傍晚和夜间照明略显单一",
    ],
    suggestions: [
      "在沙发旁增加落地灯，提供局部照明",
      "考虑在书架上方安装LED灯带",
      "更换主灯为可调节色温的智能灯具",
    ],
  },
  {
    id: "airflow",
    label: "空气流通",
    score: 88,
    icon: Wind,
    fullAnalysis: [
      "窗户位置形成良好的穿堂风条件",
      "家具布局未阻挡主要气流路径",
      "空间高度适中，热空气可有效上升排出",
      "门的位置有助于形成微循环",
    ],
    suggestions: [
      "可考虑在西北角增加小型空气净化器",
      "定期开窗通风，保持空气新鲜",
    ],
  },
  {
    id: "visual",
    label: "视觉焦点",
    score: 75,
    icon: Eye,
    fullAnalysis: [
      "电视墙作为视觉焦点清晰明确",
      "整体色调统一，以暖灰色为主",
      "装饰品数量适中，不过度杂乱",
      "但视觉层次略显单一，缺少亮点",
    ],
    suggestions: [
      "在沙发背后墙面增加一幅大尺寸装饰画",
      "考虑更换窗帘颜色，增加色彩层次",
      "添加一两件设计感强的装饰物件",
    ],
  },
  {
    id: "spacious",
    label: "空间通透度",
    score: 90,
    icon: Maximize2,
    fullAnalysis: [
      "吊顶高度充足，无压迫感",
      "家具高度选择恰当，保持视线通透",
      "地面材质统一，视觉上延伸空间",
      "镜面装饰合理运用，增加空间感",
    ],
    suggestions: [
      "可继续保持当前状态",
      "如需增加储物，建议选择低矮的储物家具",
    ],
  },
];

const implementationPlan = [
  {
    phase: "第一阶段（立即执行）",
    items: [
      "测量沙发新位置尺寸，规划移动方案",
      "选购落地灯，建议色温3000K暖白光",
      "整理茶几周围杂物，优化通道",
    ],
    budget: "¥500-1,000",
    timeline: "1-2天",
  },
  {
    phase: "第二阶段（本周内）",
    items: [
      "选购装饰画，建议尺寸 80×120cm",
      "调整窗帘杆高度，提升视觉层高",
      "重新摆放绿植位置",
    ],
    budget: "¥800-2,000",
    timeline: "3-7天",
  },
  {
    phase: "第三阶段（长期规划）",
    items: [
      "评估主灯更换需求",
      "考虑增加地毯提升舒适度",
      "季节性装饰品轮换计划",
    ],
    budget: "¥2,000-5,000",
    timeline: "1-3个月",
  },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-red-600";
};

const getScoreBg = (score: number) => {
  if (score >= 85) return "bg-emerald-50/80 border-emerald-100";
  if (score >= 70) return "bg-amber-50/80 border-amber-100";
  return "bg-red-50/80 border-red-100";
};

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Toolbar */}
      <div className="sticky top-16 z-40 border-b border-stone-200/60 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 py-3">
          <div className="flex items-center justify-between">
            <Link href="/result">
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-400 hover:text-stone-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                返回结果页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-stone-200 text-stone-600 hidden sm:flex"
              >
                <Printer className="h-4 w-4 mr-2" />
                打印
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg border-stone-200 text-stone-600 hidden sm:flex"
              >
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button
                size="sm"
                className="rounded-lg bg-stone-900 hover:bg-stone-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                下载 PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 py-10">
        <div className="bg-white rounded-[2rem] shadow-premium border border-stone-200/60 overflow-hidden">
          {/* Report Header */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white p-10 sm:p-14">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <Camera className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">FengShui Lens</h1>
                  <p className="text-xs text-stone-400">空间气场诊断器</p>
                </div>
              </div>
              <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-sm self-start sm:self-auto px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1.5" />
                专业版报告
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-3 tracking-tight">
              空间诊断报告
            </h2>
            <p className="text-stone-400 font-light">基于空间心理学与现代环境分析</p>
          </div>

          <div className="p-10 sm:p-14 space-y-12">
            {/* Report Metadata */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: "报告编号", value: reportMetadata.id },
                  { label: "生成日期", value: reportMetadata.date },
                  { label: "房间类型", value: reportMetadata.roomType },
                  { label: "房间面积", value: reportMetadata.roomSize },
                  { label: "朝向", value: reportMetadata.orientation },
                  { label: "楼层", value: reportMetadata.floor },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1.5 font-medium">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium text-stone-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <Separator className="bg-stone-100" />

            {/* Executive Summary */}
            <section>
              <h3 className="text-lg font-semibold text-stone-900 mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
                执行摘要
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className={`p-6 rounded-xl border text-center ${getScoreBg(executiveSummary.overallScore)}`}>
                  <p className="text-5xl font-bold text-stone-900 mb-2 tracking-tight">
                    {executiveSummary.overallScore}
                  </p>
                  <p className="text-sm text-stone-500 font-light">总体评分</p>
                  <Badge
                    className={`mt-4 ${
                      executiveSummary.overallScore >= 85
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}
                  >
                    {executiveSummary.rating}
                  </Badge>
                </div>
                <div className="md:col-span-3">
                  <p className="text-stone-700 leading-relaxed font-light">
                    {executiveSummary.summary}
                  </p>
                </div>
              </div>
            </section>

            <Separator className="bg-stone-100" />

            {/* Detailed Analysis */}
            <section>
              <h3 className="text-lg font-semibold text-stone-900 mb-8 flex items-center gap-2">
                <Layout className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
                详细分析
              </h3>
              <div className="space-y-6">
                {dimensionAnalysis.map((dim) => (
                  <Card key={dim.id} className="border-stone-200/60 shadow-subtle">
                    <CardHeader className="pb-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center">
                            <dim.icon className="h-5 w-5 text-stone-600" strokeWidth={1.5} />
                          </div>
                          <div>
                            <CardTitle className="text-base font-semibold text-stone-900">
                              {dim.label}
                            </CardTitle>
                            <p className="text-sm text-stone-400 font-light">
                              评分: {dim.score}/100
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-3xl font-bold ${getScoreColor(
                            dim.score
                          )}`}
                        >
                          {dim.score}
                        </div>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden mt-4">
                        <div
                          className={`h-full rounded-full ${
                            dim.score >= 85
                              ? "bg-emerald-500"
                              : dim.score >= 70
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-stone-800 mb-3">
                          分析结论
                        </h4>
                        <ul className="space-y-2">
                          {dim.fullAnalysis.map((item, i) => (
                            <li
                              key={i}
                              className="text-sm text-stone-600 flex items-start gap-3 font-light"
                            >
                              <span className="text-stone-300 mt-1.5">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {dim.suggestions.length > 0 && (
                        <div className="p-5 rounded-xl bg-stone-50 border border-stone-100">
                          <h4 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
                            改进建议
                          </h4>
                          <ul className="space-y-2">
                            {dim.suggestions.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-stone-600 flex items-start gap-3 font-light"
                              >
                                <span className="text-amber-400 mt-1">→</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-stone-100" />

            {/* Implementation Plan */}
            <section>
              <h3 className="text-lg font-semibold text-stone-900 mb-8 flex items-center gap-2">
                <Clock className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
                实施计划
              </h3>
              <div className="space-y-5">
                {implementationPlan.map((phase, index) => (
                  <Card key={index} className="border-stone-200/60 shadow-subtle">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold text-stone-900">
                          {phase.phase}
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {phase.timeline}
                          </Badge>
                          <span className="text-sm font-semibold text-stone-700">
                            {phase.budget}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {phase.items.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-stone-600 flex items-start gap-3 font-light"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-stone-100" />

            {/* Methodology Note */}
            <section>
              <h3 className="text-lg font-semibold text-stone-900 mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-stone-400" strokeWidth={1.5} />
                方法论说明
              </h3>
              <div className="p-6 rounded-xl bg-stone-50 border border-stone-100 text-sm text-stone-600 leading-relaxed font-light space-y-3">
                <p>
                  本报告基于环境心理学、空间设计原理与人体工程学进行分析。
                  我们不涉及传统命理、八字或风水迷信内容。
                </p>
                <p>
                  评分体系参考了国际室内设计师协会（IIDA）标准、
                  环境心理学研究以及现代居住舒适度研究。
                </p>
                <p>
                  建议结合实际居住体验与专业室内设计师意见，
                  制定最终的空间优化方案。
                </p>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-8 border-t border-stone-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 font-light">
                <p>© 2026 FengShui Lens. All rights reserved.</p>
                <p>本报告仅供参考，不构成专业设计建议。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
