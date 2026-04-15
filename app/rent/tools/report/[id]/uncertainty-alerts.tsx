import { AlertCircle, Info } from "lucide-react";
import { EngineResult, type Dimension } from "@/lib/rent-tools/types";

interface UncertaintyAlertsProps {
  report: EngineResult;
}

interface ReportAlert {
  type: "info" | "warning";
  title: string;
  message: string;
  suggestion?: string;
}

const dimensionLabel: Record<Dimension, string> = {
  lighting: "采光",
  noise: "噪声",
  dampness: "潮湿",
  privacy: "隐私",
  circulation: "动线",
  focus: "专注",
};

function analyzeUncertainty(report: EngineResult): ReportAlert[] {
  const alerts: ReportAlert[] = [];
  const dims = [...report.dimensions].sort((a, b) => b.score - a.score);
  const topGap = dims[0] && dims[1] ? dims[0].score - dims[1].score : 999;
  const bottomGap =
    dims[dims.length - 2] && dims[dims.length - 1]
      ? dims[dims.length - 2].score - dims[dims.length - 1].score
      : 999;

  if (topGap < 5 && dims[0] && dims[1]) {
    alerts.push({
      type: "info",
      title: "优势项差距不大",
      message: `${dimensionLabel[dims[0].dimension]}和${dimensionLabel[dims[1].dimension]}得分接近，说明这套房没有特别突出的单一优势。`,
      suggestion: "看房时可以再确认这两个维度里，哪一个对你更重要。",
    });
  }

  if (bottomGap < 5 && dims[dims.length - 2] && dims[dims.length - 1]) {
    alerts.push({
      type: "warning",
      title: "弱项不止一个",
      message: `${dimensionLabel[dims[dims.length - 2].dimension]}和${dimensionLabel[dims[dims.length - 1].dimension]}同时偏弱，后续通常不是一个动作就能补救。`,
      suggestion: "评估整改预算时，记得把两个问题一起算进去。",
    });
  }

  if (report.overallScore >= 70 && report.overallScore <= 80) {
    alerts.push({
      type: "info",
      title: "当前处于临界区间",
      message: `总分 ${report.overallScore} 落在“可以继续了解”和“需要带着问题核验”的交界附近。`,
      suggestion: "噪声、采光和潮湿最好在现场亲自复核后再做最终决定。",
    });
  }

  if (report.overallScore >= 50 && report.overallScore <= 60) {
    alerts.push({
      type: "warning",
      title: "接近放弃边界",
      message: `总分 ${report.overallScore} 已经靠近“先别急着租”的分界线。`,
      suggestion: "除非房东愿意让价或问题能低成本修正，否则继续投入的性价比不高。",
    });
  }

  const photoDependentRisks = report.risks.filter((risk) =>
    ["damp_signs", "window_blocked", "wall_damp"].includes(risk.id)
  );

  if (photoDependentRisks.length > 0) {
    alerts.push({
      type: "info",
      title: "部分判断依赖现场确认",
      message: `${photoDependentRisks.map((item) => item.title).join("、")} 这类问题最好结合照片或实地查看确认。`,
      suggestion: "看房时记得重点查看墙角、窗边和卫生间附近。",
    });
  }

  return alerts;
}

export function UncertaintyAlerts({ report }: UncertaintyAlertsProps) {
  const alerts = analyzeUncertainty(report);

  if (alerts.length === 0) {
    return (
      <section className="paper-panel rounded-[1.8rem] p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-1 h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-medium text-foreground">当前判断相对稳定</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              基于你提供的信息，这份判断卡没有明显的临界或冲突信号，适合作为继续决策的第一参考。
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="paper-panel rounded-[1.8rem] p-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 text-primary" />
        <span className="section-kicker">补充说明</span>
      </div>

      <div className="mt-5 space-y-3">
        {alerts.map((alert) => (
          <article
            key={`${alert.type}-${alert.title}`}
            className={`rounded-[1.35rem] border px-4 py-4 ${
              alert.type === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-sky-200 bg-sky-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`mt-1 h-5 w-5 ${
                  alert.type === "warning" ? "text-amber-600" : "text-sky-600"
                }`}
              />
              <div>
                <h3 className="text-sm font-medium text-foreground">{alert.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{alert.message}</p>
                {alert.suggestion ? (
                  <p className="mt-2 text-sm leading-7 text-secondary-foreground">
                    <span className="font-medium text-foreground">建议：</span>
                    {alert.suggestion}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
