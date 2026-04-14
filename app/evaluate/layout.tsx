import Link from "next/link";
import { StepIndicator } from "@/components/step-indicator";

export default function EvaluateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-[0.68rem] font-semibold tracking-[0.32em] text-muted-foreground">
              SR
            </div>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                SpaceRisk
              </p>
              <p className="font-display text-lg text-foreground">预筛录入</p>
            </div>
          </Link>
          <StepIndicator />
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="paper-panel rounded-[1.75rem] p-5">
              <div className="section-kicker">填写提示</div>
              <h2 className="mt-4 font-display text-2xl leading-tight text-balance">
                像做一张现场勘验卡一样填写。
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                先填客观信息，再补主观需求。越容易确认的内容越靠前，这样在手机上也能快速完成。
              </p>
            </div>
          </aside>

          <section className="paper-panel paper-grid rounded-[2rem] p-6 sm:p-8">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
