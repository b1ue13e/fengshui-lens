import { ReportView } from "./report-view";
import type { EvaluationReport } from "@/lib/rent-tools/types";

const sampleReport: EvaluationReport = {
  id: "sample-report",
  createdAt: new Date("2026-04-14T10:00:00+08:00"),
  verdict: "cautious",
  overallScore: 74,
  scores: {
    lighting: 82,
    noise: 61,
    dampness: 72,
    privacy: 76,
    circulation: 78,
    focus: 67,
  },
  dimensions: [
    { dimension: "lighting", score: 82, weight: 1, factors: [] },
    { dimension: "noise", score: 61, weight: 1, factors: [] },
    { dimension: "dampness", score: 72, weight: 1, factors: [] },
    { dimension: "privacy", score: 76, weight: 1, factors: [] },
    { dimension: "circulation", score: 78, weight: 1, factors: [] },
    { dimension: "focus", score: 67, weight: 1, factors: [] },
  ],
  risks: [
    {
      id: "main-road-noise",
      severity: "high",
      dimension: "noise",
      title: "晚间噪声需要实地确认",
      description: "卧室朝向主干道，白天看房可能低估晚高峰和夜间车流影响。",
      modernReason: "如果睡眠是刚需，这类问题通常很难靠低成本手段完全补救。",
    },
    {
      id: "west-sun",
      severity: "medium",
      dimension: "lighting",
      title: "下午西晒可能偏强",
      description: "夏季高温时段容易过热，尤其是窗边和工作区。",
      modernReason: "会增加遮光、降温和长期使用空调的成本。",
    },
  ],
  actions: [
    {
      code: "seal-window",
      title: "先确认窗体密封和隔音表现",
      subtitle: "看房时优先试窗、听路噪，再决定要不要谈价。",
      description: "重点确认窗缝、双层玻璃和夜间路噪。",
      costLevel: "low",
      costRange: "0-500 元",
      difficulty: "easy",
      timeRequired: "当天可完成判断",
      requirements: {
        needsBuyMaterials: false,
        needsFurnitureMove: false,
        needsLightRenovation: false,
      },
      expectedBenefit: {
        description: "避免在噪声判断上误判。",
        score: 9,
      },
      targetsRisks: ["main-road-noise"],
      priorityReason: "这是最容易决定“继续核验还是换房”的关键问题。",
    },
    {
      code: "sun-shading",
      title: "预留遮光和降温方案",
      subtitle: "如果整体价格合适，再评估是否接受后续小额补救。",
      description: "可通过窗帘、隔热膜和风扇配合处理。",
      costLevel: "medium",
      costRange: "300-1200 元",
      difficulty: "easy",
      timeRequired: "1-2 天",
      requirements: {
        needsBuyMaterials: true,
        needsFurnitureMove: false,
        needsLightRenovation: false,
      },
      expectedBenefit: {
        description: "降低西晒造成的体感波动。",
        score: 6,
      },
      targetsRisks: ["west-sun"],
      priorityReason: "属于可补救问题，但是否接受取决于你的预算和怕热程度。",
    },
  ],
  summaryText:
    "这套房的整体底子不差，采光、隐私和动线都在可接受区间。\n\n真正需要现场再确认的是噪声上限，尤其是卧室朝向主路的时段差异。\n\n如果晚间噪声能接受，它更像是一套“带着问题继续核验”的房源，而不是需要立刻放弃的选项。",
  chatScripts: [],
  decisionNote: {
    type: "structural_defect",
    title: "噪声是这套房的决策分水岭",
    message: "如果你对睡眠质量要求高，晚间主路噪声会比白天看房时更重要，建议专门在高峰时段复核一次。",
    severity: "medium",
  },
};

export default function ReportSamplePage() {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <ReportView
          report={sampleReport}
          isSample
          showFeedback={false}
          showDebug={false}
          primaryHref="/rent/tools/evaluate"
          primaryLabel="开始生成我的判断卡"
          secondaryHref="/rent/tools/compare"
          secondaryLabel="先去对比房源"
        />
      </div>
    </div>
  );
}
