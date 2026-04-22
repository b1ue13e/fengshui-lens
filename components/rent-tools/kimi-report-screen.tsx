"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  XCircle,
  MapPin,
  Plus,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildReportGuidance } from "@/lib/rent-tools/report-guidance";
import type { EvaluationReport } from "@/lib/rent-tools/types";

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === "rent") {
    return (
      <Badge className="bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
        <ShieldCheck className="mr-1 h-4 w-4" />值得谈
      </Badge>
    );
  }
  if (verdict === "cautious") {
    return (
      <Badge className="bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600">
        <AlertTriangle className="mr-1 h-4 w-4" />谨慎推进
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
      <XCircle className="mr-1 h-4 w-4" />建议放弃
    </Badge>
  );
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <span className="font-medium">{score}分</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export function KimiReportScreen({ report }: { report: EvaluationReport }) {
  const [copied, setCopied] = useState(false);
  const guidance = buildReportGuidance(report);

  const handleCopy = async () => {
    const text = `【青年大学习 · 租房判断报告】\n结论：${
      report.verdict === "rent" ? "值得谈" : report.verdict === "cautious" ? "谨慎推进" : "建议放弃"
    }\n总分：${report.overallScore}/100\n\n关键风险：\n${report.risks.map((r) => `· ${r.description}`).join("\n")}\n\n优先确认：\n${guidance.keyQuestions.map((q) => `· ${q}`).join("\n")}\n\n话术模板：\n${guidance.brokerMessage}\n`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/" className="flex items-center gap-1 hover:text-neutral-900">
          <Home className="h-4 w-4" /> 首页
        </Link>
        <span>/</span>
        <span>判断报告</span>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">租房判断报告</h1>
            <p className="text-neutral-500">{report.summaryText.split("\n")[0]}</p>
          </div>
          <div className="shrink-0">
            <VerdictBadge verdict={report.verdict} />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="text-3xl font-bold text-neutral-900">{report.overallScore}</div>
          <div className="text-sm text-neutral-500">综合评分<br />满分100</div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
          <BarChart3 className="h-5 w-5" />
          空间维度（6维）
        </h2>
        <div className="space-y-4">
          {report.dimensions.map((d) => (
            <ScoreBar
              key={d.dimension}
              label={`${d.dimension} (权重×${d.weight.toFixed(1)})`}
              score={d.score}
              color={d.score >= 70 ? "bg-green-500" : d.score >= 50 ? "bg-amber-500" : "bg-red-500"}
            />
          ))}
        </div>
        <div className="mt-4 text-sm text-neutral-500">
          {report.dimensions.flatMap((d) => d.factors.map((factor) => factor.reason)).slice(0, 4).map((detail, i) => (
            <p key={i}>· {detail}</p>
          ))}
        </div>
      </div>

      {report.decisionPillars && report.decisionPillars.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">决策支柱（5个）</h2>
          <div className="space-y-4">
            {report.decisionPillars.map((p) => (
              <ScoreBar
                key={p.pillar}
                label={p.label}
                score={p.score}
                color={p.score >= 70 ? "bg-green-500" : p.score >= 50 ? "bg-amber-500" : "bg-red-500"}
              />
            ))}
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            {report.decisionPillars.flatMap((p) => p.evidence).slice(0, 4).map((detail, i) => (
              <p key={i}>· {detail}</p>
            ))}
          </div>
        </div>
      ) : null}

      {report.risks.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            关键风险
          </h2>
          <div className="space-y-3">
            {report.risks.map((risk, i) => (
              <div
                key={`${risk.id}-${i}`}
                className={`rounded-lg border p-3 ${
                  risk.severity === "high"
                    ? "border-red-200 bg-red-50"
                    : risk.severity === "medium"
                      ? "border-amber-200 bg-amber-50"
                      : "border-neutral-200 bg-neutral-50"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      risk.severity === "high"
                        ? "border-red-300 text-red-700"
                        : risk.severity === "medium"
                          ? "border-amber-300 text-amber-700"
                          : "border-neutral-300 text-neutral-600"
                    }
                  >
                    {risk.severity === "high" ? "高风险" : risk.severity === "medium" ? "中风险" : "低风险"}
                  </Badge>
                  <span className="text-sm font-medium text-neutral-700">{risk.title}</span>
                </div>
                <p className="text-sm text-neutral-600">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">三个最该优先确认的问题</h2>
        <ol className="space-y-3">
          {guidance.keyQuestions.slice(0, 3).map((q, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">{i + 1}</span>
              <p className="text-neutral-700">{q}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-neutral-900">下一步动作建议</h2>
        <ul className="space-y-2">
          {guidance.nextMoves.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-neutral-700">
              <span className="mt-1 text-neutral-400">›</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">可复制话术模板</h2>
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "已复制" : "复制"}
          </Button>
        </div>
        <div className="rounded-lg bg-neutral-50 p-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
          {guidance.brokerMessage}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/rent/tools/compare">
          <Button variant="outline" className="gap-2 border-neutral-300">
            <Plus className="h-4 w-4" />
            加入对比
          </Button>
        </Link>
        <Link href="/rent/tools/compare">
          <Button variant="outline" className="gap-2 border-neutral-300">
            <BarChart3 className="h-4 w-4" />
            去对比
          </Button>
        </Link>
        <Link href="/survival-plans/start">
          <Button className="gap-2 bg-neutral-900 hover:bg-neutral-800">
            <MapPin className="h-4 w-4" />
            决定来上海？生成落地路线
          </Button>
        </Link>
      </div>

      <div className="flex justify-start">
        <Link href="/rent/tools/evaluate">
          <Button variant="ghost" className="gap-2 text-neutral-700 hover:bg-neutral-100">
            <ArrowLeft className="h-4 w-4" />
            重新评估
          </Button>
        </Link>
      </div>
    </div>
  );
}