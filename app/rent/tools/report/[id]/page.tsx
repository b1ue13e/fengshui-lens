import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRentToolEvaluationById } from "@/lib/repositories/rent-tool-repository";

import { CopyReportLinkButton } from "../copy-report-link-button";
import { ReportView } from "../report-view";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const isShareMode = resolvedSearchParams.mode === "share";
  const report = await getRentToolEvaluationById(id);

  if (!report) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="paper-panel rounded-[2rem] px-6 py-16 text-center">
            <h1 className="font-display text-3xl text-foreground">这份判断卡不存在</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              可能是链接失效了，或者这次评估还没有成功生成。
            </p>
            <Link href="/rent/tools/evaluate">
              <Button className="mt-6 rounded-full px-5">开始新的租房判断</Button>
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
            <Badge className="border-border bg-secondary text-secondary-foreground">
              分享视图
            </Badge>
            <Link href={`/rent/tools/report/${report.id}`}>
              <Button
                variant="outline"
                className="rounded-full border-border bg-background/80"
              >
                查看完整判断卡
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <ReportView
            report={report}
            showFeedback={false}
            showDebug={false}
            primaryHref="/rent/tools/evaluate"
            primaryLabel="自己生成一份判断卡"
            secondaryHref={`/rent/tools/report/${report.id}`}
            secondaryLabel="打开完整判断卡"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/rent/tools/evaluate"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回填写流程
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="border-border bg-secondary text-secondary-foreground">
              判断结果
            </Badge>
            <CopyReportLinkButton />
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
