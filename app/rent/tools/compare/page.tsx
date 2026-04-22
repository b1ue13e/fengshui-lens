import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Home,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildRentalEntryMetadata } from "@/lib/metadata/page-metadata";
import { getRentToolEvaluationById } from "@/lib/repositories/rent-tool-repository";
import type { EvaluationReport } from "@/lib/rent-tools/types";
import { DIMENSION_LABELS } from "@/lib/rent-tools/types";

export const metadata: Metadata = buildRentalEntryMetadata(
  "房源对比取舍",
  "这是青年大学习第一课里的最后取舍页。当前先从上海首次租房切入，比较两套房谁更值得继续谈，而不是单纯比谁分更高。",
  "/rent/tools/compare"
);

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "rent") return <CheckCircle2 className="h-8 w-8 text-green-600" />;
  if (verdict === "cautious") return <AlertTriangle className="h-8 w-8 text-amber-500" />;
  return <XCircle className="h-8 w-8 text-red-600" />;
}

function VerdictText({ verdict }: { verdict: string }) {
  if (verdict === "rent") return <span className="font-bold text-green-600">值得谈</span>;
  if (verdict === "cautious") return <span className="font-bold text-amber-600">谨慎推进</span>;
  return <span className="font-bold text-red-600">建议放弃</span>;
}

function buildCompareHref(ids: string[]) {
  if (ids.length === 0) return "/rent/tools/compare";
  if (ids.length === 1) return `/rent/tools/compare?left=${ids[0]}`;
  return `/rent/tools/compare?left=${ids[0]}&right=${ids[1]}`;
}

function mapRiskLevel(report: EvaluationReport) {
  return report.risks.map((risk) => ({
    category: risk.title,
    level:
      risk.severity === "high"
        ? "fatal"
        : risk.severity === "medium"
          ? "high"
          : "normal",
  }));
}

function CompareCard({
  report,
  onRemoveHref,
}: {
  report: EvaluationReport;
  onRemoveHref: string;
}) {
  const dimensions = report.dimensions.slice(0, 4).map((item) => ({
    name: DIMENSION_LABELS[item.dimension],
    score: item.score,
  }));
  const pillars = (report.decisionPillars ?? []).slice(0, 3).map((item) => ({
    name: item.label,
    score: item.score,
  }));
  const risks = mapRiskLevel(report);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <VerdictIcon verdict={report.verdict} />
          <VerdictText verdict={report.verdict} />
        </div>
        <Link href={onRemoveHref} className="rounded-md p-2 transition hover:bg-neutral-100">
          <Trash2 className="h-4 w-4 text-neutral-400" />
        </Link>
      </div>

      <div className="mb-1 text-3xl font-bold text-neutral-900">{report.overallScore}分</div>
      <p className="mb-4 text-sm text-neutral-500">综合评分</p>

      <div className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-neutral-400">空间维度</p>
          {dimensions.map((d) => (
            <div key={d.name} className="flex justify-between py-1 text-sm">
              <span className="text-neutral-600">{d.name}</span>
              <span
                className={`font-medium ${
                  d.score >= 70 ? "text-green-600" : d.score >= 50 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {d.score}
              </span>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase text-neutral-400">决策支柱</p>
          {(pillars.length ? pillars : [{ name: "继续补证据", score: report.overallScore }]).map((p) => (
            <div key={p.name} className="flex justify-between py-1 text-sm">
              <span className="text-neutral-600">{p.name}</span>
              <span
                className={`font-medium ${
                  p.score >= 70 ? "text-green-600" : p.score >= 50 ? "text-amber-600" : "text-red-600"
                }`}
              >
                {p.score}
              </span>
            </div>
          ))}
        </div>

        {risks.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-neutral-400">主要风险</p>
            <div className="space-y-1">
              {risks.slice(0, 3).map((r, i) => (
                <Badge
                  key={`${r.category}-${i}`}
                  variant="outline"
                  className={
                    r.level === "fatal"
                      ? "border-red-300 text-red-700"
                      : r.level === "high"
                        ? "border-amber-300 text-amber-700"
                        : "border-neutral-300 text-neutral-600"
                  }
                >
                  {r.category}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ left?: string; right?: string }>;
}) {
  const { left, right } = await searchParams;
  const requestedIds = [left, right].filter(Boolean) as string[];

  const fetchedReports = await Promise.all(
    Array.from(new Set(requestedIds)).map(async (id) => ({
      id,
      report: await getRentToolEvaluationById(id),
    }))
  );

  const reports = fetchedReports.filter((item) => item.report).map((item) => ({
    id: item.id,
    report: item.report!,
  }));

  if (reports.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 py-20 text-center">
        <BarChart3 className="mx-auto h-16 w-16 text-neutral-300" />
        <h1 className="text-xl font-bold text-neutral-900">还没有房源加入对比</h1>
        <p className="text-neutral-500">完成租房判断后，点击“加入对比”即可在此比较不同房源</p>
        <Link href="/rent/tools/evaluate">
          <Button className="bg-neutral-900 hover:bg-neutral-800">去做第一个判断</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/" className="flex items-center gap-1 hover:text-neutral-900">
          <Home className="h-4 w-4" /> 首页
        </Link>
        <span>/</span>
        <span>两套房对比</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">房源对比</h1>
        <Link href="/rent/tools/compare" className="inline-flex items-center gap-2 text-sm text-red-600">
          <Trash2 className="h-4 w-4" /> 清空
        </Link>
      </div>

      <div
        className={`grid gap-4 ${
          reports.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {reports.map(({ id, report }) => {
          const nextIds = reports.filter((item) => item.id !== id).map((item) => item.id);
          return <CompareCard key={id} report={report} onRemoveHref={buildCompareHref(nextIds)} />;
        })}

        {reports.length === 1 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white p-6 text-center">
            <Plus className="mb-3 h-10 w-10 text-neutral-300" />
            <p className="mb-4 text-neutral-500">还可以加入一套房源对比</p>
            <Link href="/rent/tools/evaluate">
              <Button variant="outline" className="border-neutral-300">去评估另一套</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex justify-start">
        <Link href="/rent/tools/evaluate">
          <Button variant="ghost" className="gap-2 text-neutral-700 hover:bg-neutral-100">
            <ArrowLeft className="h-4 w-4" />
            继续评估
          </Button>
        </Link>
      </div>
    </div>
  );
}