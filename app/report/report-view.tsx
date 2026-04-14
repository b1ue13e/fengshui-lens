"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Droplets,
  Eye,
  FileText,
  Lightbulb,
  Route,
  ShieldAlert,
  Sparkles,
  Sun,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DecisionNoteCard } from "@/components/ui/decision-note";
import { DebugPanel } from "./[id]/debug-panel";
import { ChatScriptSection } from "./[id]/chat-section";
import { UncertaintyAlerts } from "./[id]/uncertainty-alerts";
import { FeedbackSection } from "./[id]/feedback-section";
import { EvaluationReport, type Dimension, type Verdict } from "@/types";

type ReportViewProps = {
  report: EvaluationReport;
  isSample?: boolean;
  showFeedback?: boolean;
  showDebug?: boolean;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

const dimensionMeta: Record<
  Dimension,
  { label: string; icon: typeof Sun; accent: string; soft: string }
> = {
  lighting: { label: "采光", icon: Sun, accent: "bg-amber-500", soft: "bg-amber-50 text-amber-700" },
  noise: { label: "噪声", icon: Volume2, accent: "bg-sky-500", soft: "bg-sky-50 text-sky-700" },
  dampness: { label: "潮湿", icon: Droplets, accent: "bg-cyan-500", soft: "bg-cyan-50 text-cyan-700" },
  privacy: { label: "隐私", icon: Eye, accent: "bg-violet-500", soft: "bg-violet-50 text-violet-700" },
  circulation: { label: "动线", icon: Route, accent: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700" },
  focus: { label: "专注", icon: Brain, accent: "bg-indigo-500", soft: "bg-indigo-50 text-indigo-700" },
};

const verdictMeta: Record<
  Verdict,
  { label: string; summary: string; chip: string; panel: string }
> = {
  rent: {
    label: "值得继续谈",
    summary: "整体条件较稳，可以继续看合同、价格和细节谈判。",
    chip: "bg-emerald-100 text-emerald-800 border-emerald-200",
    panel: "bg-emerald-50 border-emerald-200",
  },
  cautious: {
    label: "要带着问题继续看",
    summary: "不是直接放弃，但必须把关键风险核验清楚再决定。",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    panel: "bg-amber-50 border-amber-200",
  },
  avoid: {
    label: "不建议继续投入时间",
    summary: "存在较难低成本修正的问题，继续谈的性价比偏低。",
    chip: "bg-red-100 text-red-800 border-red-200",
    panel: "bg-red-50 border-red-200",
  },
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parseSummary(text: string) {
  return text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function getPrimaryInsight(report: EvaluationReport) {
  const weakest = [...report.dimensions].sort((a, b) => a.score - b.score)[0];
  const strongest = [...report.dimensions].sort((a, b) => b.score - a.score)[0];
  const risk = report.risks[0];

  return {
    weakest: weakest ? dimensionMeta[weakest.dimension].label : "暂无",
    strongest: strongest ? dimensionMeta[strongest.dimension].label : "暂无",
    riskTitle: risk?.title ?? "暂无明显高优先级问题",
  };
}

function getSuitability(report: EvaluationReport) {
  const goodFor: string[] = [];
  const avoidFor: string[] = [];

  if (report.scores.noise >= 72 && report.scores.privacy >= 70) {
    goodFor.push("对安静和边界感要求高的人");
  }
  if (report.scores.lighting >= 75) {
    goodFor.push("偏好白天明亮空间的人");
  }
  if (report.verdict === "rent") {
    goodFor.push("希望减少反复看房成本的租客");
  }

  if (report.scores.noise < 60 || report.scores.focus < 60) {
    avoidFor.push("长期居家办公或备考");
  }
  if (report.scores.dampness < 60) {
    avoidFor.push("对潮湿和异味敏感");
  }
  if (report.verdict === "avoid") {
    avoidFor.push("希望稳定长住、懒得折腾");
  }

  return {
    goodFor: goodFor.slice(0, 3),
    avoidFor: avoidFor.slice(0, 3),
  };
}

function DimensionMeter({ dimension, score }: { dimension: Dimension; score: number }) {
  const meta = dimensionMeta[dimension];
  const Icon = meta.icon;

  return (
    <div className="space-y-2 rounded-[1.35rem] bg-background/72 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.soft}`}>
            <Icon className="size-4" />
          </span>
          <span className="text-sm font-medium text-foreground">{meta.label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground">{score}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${meta.accent}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function RiskItem({ report }: { report: EvaluationReport }) {
  const items = report.risks.slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="rounded-[1.35rem] border border-border bg-background/72 px-4 py-4 text-sm text-muted-foreground">
        当前没有明显的高优先级风险项，建议仍然在看房现场核验采光和噪声。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((risk, index) => (
        <article
          key={risk.id}
          className="rounded-[1.35rem] border border-border bg-background/72 px-4 py-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {index + 1}
            </span>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{risk.title}</h3>
                <Badge
                  className={
                    risk.severity === "high"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }
                >
                  {risk.severity === "high" ? "高优先级" : "需关注"}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{risk.description}</p>
              {risk.modernReason ? (
                <p className="text-sm leading-7 text-secondary-foreground">
                  <span className="font-medium text-foreground">为什么影响决策：</span>
                  {risk.modernReason}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ActionList({ report }: { report: EvaluationReport }) {
  const items = report.actions.slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="rounded-[1.35rem] border border-border bg-background/72 px-4 py-4 text-sm text-muted-foreground">
        当前没有明确的优先动作，建议先带着报告去现场核验后再决定。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((action, index) => (
        <article
          key={action.code}
          className="rounded-[1.35rem] border border-border bg-background/72 px-4 py-4"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">{action.title}</h3>
                <Badge className="bg-secondary text-secondary-foreground border-border">
                  {action.costRange}
                </Badge>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{action.subtitle}</p>
              <p className="text-sm leading-7 text-secondary-foreground">
                <span className="font-medium text-foreground">优先原因：</span>
                {action.priorityReason}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ReportView({
  report,
  isSample = false,
  showFeedback = true,
  showDebug = false,
  primaryHref = "/evaluate",
  primaryLabel = "重新评估另一套房",
  secondaryHref = "/compare",
  secondaryLabel = "去做房源对比",
}: ReportViewProps) {
  const verdict = verdictMeta[report.verdict];
  const summaryLines = parseSummary(report.summaryText);
  const insight = getPrimaryInsight(report);
  const suitability = getSuitability(report);

  return (
    <div className="space-y-6">
      {isSample ? (
        <div className="editorial-note">
          <p className="text-sm leading-7 text-secondary-foreground">
            这是一个静态样例页，用来预览“预筛报告”的信息结构和视觉语言。真实报告会在提交评估后生成。
          </p>
        </div>
      ) : null}

      <section className="paper-panel rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <div className="section-kicker">预筛报告</div>
            <div className="space-y-3">
              <h1 className="font-display text-4xl leading-tight text-balance text-foreground sm:text-5xl">
                先看结论，再决定要不要继续谈。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                这份报告会先告诉你该继续推进、带着问题去现场核验，还是及时止损，把时间省给下一个房源。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="data-chip text-sm text-secondary-foreground">报告编号 {report.id}</span>
              <span className="data-chip text-sm text-secondary-foreground">
                生成于 {formatDate(report.createdAt)}
              </span>
            </div>

            {summaryLines.length > 0 ? (
              <div className="space-y-2">
                {summaryLines.map((line) => (
                  <div
                    key={line}
                    className="rounded-[1.2rem] border border-border bg-background/72 px-4 py-3 text-sm leading-7 text-muted-foreground"
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className={`rounded-[1.8rem] border px-5 py-5 sm:px-6 sm:py-6 ${verdict.panel}`}>
            <div className="flex items-center justify-between gap-3">
              <Badge className={verdict.chip}>{verdict.label}</Badge>
              <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Score
              </span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-6xl leading-none text-foreground">
                {report.overallScore}
              </span>
              <span className="pb-2 text-sm text-muted-foreground">/100</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-secondary-foreground">
              {verdict.summary}
            </p>
            <div className="detail-rule my-5" />
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">最弱项</p>
                <p className="mt-1 text-sm font-medium text-foreground">{insight.weakest}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">最稳项</p>
                <p className="mt-1 text-sm font-medium text-foreground">{insight.strongest}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">首要问题</p>
                <p className="mt-1 text-sm font-medium text-foreground">{insight.riskTitle}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {report.decisionNote ? <DecisionNoteCard note={report.decisionNote} className="mt-0" /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <section className="space-y-6">
          <div className="paper-panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-primary" />
              <span className="section-kicker">结论摘要</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-background/72 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">适合谁</p>
                <div className="mt-3 space-y-2">
                  {(suitability.goodFor.length > 0
                    ? suitability.goodFor
                    : ["需求相对均衡、愿意按报告继续核验的租客"]
                  ).map((item) => (
                    <p key={item} className="text-sm leading-7 text-foreground">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.35rem] bg-background/72 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">不适合谁</p>
                <div className="mt-3 space-y-2">
                  {(suitability.avoidFor.length > 0
                    ? suitability.avoidFor
                    : ["现场核验后再决定，没有明显单一人群限制"]
                  ).map((item) => (
                    <p key={item} className="text-sm leading-7 text-foreground">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="paper-panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span className="section-kicker">主要风险</span>
            </div>
            <div className="mt-5">
              <RiskItem report={report} />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="paper-panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span className="section-kicker">六维评分</span>
            </div>
            <div className="mt-5 space-y-3">
              {report.dimensions
                .slice()
                .sort((a, b) => b.score - a.score)
                .map((item) => (
                  <DimensionMeter
                    key={item.dimension}
                    dimension={item.dimension}
                    score={item.score}
                  />
                ))}
            </div>
          </div>

          <div className="paper-panel rounded-[1.8rem] p-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" />
              <span className="section-kicker">优先动作</span>
            </div>
            <div className="mt-5">
              <ActionList report={report} />
            </div>
          </div>
        </aside>
      </div>

      <ChatScriptSection report={report} />
      <UncertaintyAlerts report={report} />

      {showFeedback ? <FeedbackSection reportId={report.id} /> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={primaryHref} className="flex-1">
          <Button variant="outline" className="h-12 w-full rounded-full border-border bg-background/80">
            {primaryLabel}
          </Button>
        </Link>
        <Link href={secondaryHref} className="flex-1">
          <Button className="h-12 w-full rounded-full">
            {secondaryLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {showDebug ? <DebugPanel report={report} /> : null}
    </div>
  );
}
