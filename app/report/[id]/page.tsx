"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { getEvaluation } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EvaluationReport } from "@/types";
import { ReportView } from "../report-view";

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isShareMode = searchParams.get("mode") === "share";
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
      <div className="min-h-screen bg-background px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="paper-panel rounded-[2rem] px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-muted-foreground">正在整理预筛报告...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="paper-panel rounded-[2rem] px-6 py-16 text-center">
            <h1 className="font-display text-3xl text-foreground">这份报告不存在</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              可能是链接失效，或者这份评估还没有成功生成。
            </p>
            <Link href="/evaluate">
              <Button className="mt-6 rounded-full px-5">开始新的预筛</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isShareMode) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge className="bg-secondary text-secondary-foreground border-border">
              分享视图
            </Badge>
            <Link href={`/report/${report.id}`}>
              <Button variant="outline" className="rounded-full border-border bg-background/80">
                查看完整报告
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ReportView
            report={report}
            showFeedback={false}
            showDebug={false}
            primaryHref="/evaluate"
            primaryLabel="自己生成一份预筛报告"
            secondaryHref={`/report/${report.id}`}
            secondaryLabel="打开完整报告"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/evaluate" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            返回评估流程
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary text-secondary-foreground border-border">
              预筛结果
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-border bg-background/80"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              复制链接
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">
          <ReportView report={report} showFeedback showDebug />
        </div>
      </main>
    </div>
  );
}
