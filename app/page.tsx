import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Lightbulb,
  MessageSquare,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const trustSignals = [
  { value: "3 分钟内", label: "完成一次房源预筛" },
  { value: "6 个维度", label: "覆盖常见居住风险" },
  { value: "低成本建议", label: "结果可直接带去看房" },
];

const reviewLines = [
  { label: "采光与朝向", status: "需要核验", tone: "warning" as const },
  { label: "噪声与临街", status: "高敏项", tone: "danger" as const },
  { label: "潮湿与通风", status: "可补救", tone: "neutral" as const },
  { label: "隐私与视线", status: "重点观察", tone: "warning" as const },
];

const dimensions = [
  {
    title: "采光",
    description: "先判断白天亮度、晚间阴冷感和晾晒成本。",
  },
  {
    title: "噪声",
    description: "把临街、地铁、商铺和楼上干扰拆开来看。",
  },
  {
    title: "潮湿",
    description: "识别低楼层返潮、暗卫和墙角发霉的概率。",
  },
  {
    title: "隐私",
    description: "评估窗距、走廊视线和开门见厅带来的压迫感。",
  },
  {
    title: "通风",
    description: "结合户型和朝向，预判夏季闷热与异味滞留。",
  },
  {
    title: "改造成本",
    description: "标出哪些问题能用低预算修正，哪些不值得谈。",
  },
];

const steps = [
  {
    index: "01",
    title: "填入客观信息",
    description: "户型、面积、朝向、楼层这些能快速确认的条件先填完。",
    icon: ClipboardCheck,
  },
  {
    index: "02",
    title: "补充现场细节",
    description: "把你在看房时最担心的噪声、潮湿、视线和通风补进去。",
    icon: Search,
  },
  {
    index: "03",
    title: "拿到预筛报告",
    description: "系统先给结论，再展开风险依据、改造建议和沟通话术。",
    icon: FileText,
  },
];

function toneClassName(tone: "danger" | "warning" | "neutral") {
  if (tone === "danger") {
    return "bg-destructive/10 text-destructive";
  }

  if (tone === "warning") {
    return "bg-accent text-accent-foreground";
  }

  return "bg-secondary text-secondary-foreground";
}

export default function HomePage() {
  return (
    <div className="min-h-screen text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-[0.7rem] font-semibold tracking-[0.35em] text-muted-foreground">
              SR
            </div>
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                SpaceRisk
              </p>
              <p className="font-display text-lg text-foreground">租房预筛报告</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/compare" className="transition-colors hover:text-foreground">
              房源对比
            </Link>
            <Link href="/report" className="transition-colors hover:text-foreground">
              历史报告
            </Link>
            <Link href="/evaluate" className="transition-colors hover:text-foreground">
              开始评估
            </Link>
          </nav>

          <Link href="/evaluate">
            <Button className="h-10 rounded-full px-5 text-sm">
              立即预筛
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-8">
            <div className="section-kicker">租房前先做一轮理性预筛</div>

            <div className="space-y-5">
              <h1 className="font-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
                像看一份现场勘验摘要那样，
                <br />
                先判断这套房值不值得继续谈。
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                SpaceRisk
                不做玄学包装，而是把租房里最容易被忽略的采光、噪声、潮湿、隐私和改造成本整理成一份能快速阅读的预筛报告。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-secondary-foreground">
              <span className="data-chip">先给结论，再展开依据</span>
              <span className="data-chip">适合手机上快速看完</span>
              <span className="data-chip">输出能直接拿去沟通</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/evaluate">
                <Button className="h-12 rounded-full px-6 text-base">
                  免费开始评估
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/compare">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-border bg-card px-6 text-base text-foreground hover:bg-secondary"
                >
                  先看房源对比
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {trustSignals.map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="font-display text-2xl text-foreground">{item.value}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="paper-panel paper-grid relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="absolute right-6 top-6 hidden rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground sm:block">
              现场摘要预览
            </div>

            <div className="space-y-4">
              <div className="section-kicker">一分钟读完重点</div>
              <h2 className="font-display max-w-sm text-3xl leading-tight text-balance sm:text-[2.4rem]">
                把明显不合适的房源先筛掉，把还能谈的房源谈明白。
              </h2>
              <p className="max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
                结果页会把风险、可修正空间和建议动作拆开，让你知道这套房是该放弃、压价，还是继续看。
              </p>
            </div>

            <div className="detail-rule my-7" />

            <div className="space-y-3">
              {reviewLines.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-card/75 px-4 py-3 backdrop-blur-sm"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{line.label}</p>
                    <p className="text-xs text-muted-foreground">看房时优先核验这一项</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${toneClassName(line.tone)}`}
                  >
                    {line.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  输出结构
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">风险结论 + 依据摘要</p>
              </div>
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  预算视角
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">哪些问题能低成本修正</p>
              </div>
              <div className="rounded-2xl bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  看房动作
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">现场重点确认项清单</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-5">
            <div className="section-kicker">判断框架</div>
            <h2 className="font-display text-3xl leading-tight text-balance sm:text-4xl">
              不靠感觉，靠六个最容易影响居住体验的变量。
            </h2>
            <p className="max-w-xl text-base leading-8 text-muted-foreground">
              用户通常在手机上快速对比多个房源，所以信息必须短、准、能扫读。我们把最核心的判断维度整理成能一眼区分优先级的结构。
            </p>
            <div className="editorial-note max-w-xl">
              <p className="text-sm leading-7 text-secondary-foreground">
                这不是给你一个“神秘分数”，而是把为什么不舒服、哪里能补救、值不值得谈清楚。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {dimensions.map((item, index) => (
              <article
                key={item.title}
                className="paper-panel rounded-[1.6rem] p-5 sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    必查项
                  </span>
                </div>
                <h3 className="font-display text-2xl text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="section-kicker">你会拿到什么</div>
              <h2 className="font-display text-3xl leading-tight text-balance sm:text-4xl">
                首页不是在卖功能，而是在预览一套更可靠的决策方式。
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              重点不是堆更多指标，而是让风险、可修正空间和下一步动作在同一个视野里出现。
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="section-kicker">风险摘要</div>
                  <h3 className="mt-3 font-display text-3xl leading-tight text-balance">
                    先告诉你该不该继续看，再展开依据和补救空间。
                  </h3>
                </div>
                <ShieldAlert className="mt-1 size-7 text-primary" />
              </div>

              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
                你会先看到一份可扫读的结论摘要，包括最值得担心的风险、是否适合继续谈，以及看房现场最需要确认的几件事。
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-background/80 p-4">
                  <p className="text-sm font-medium text-foreground">风险排序</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    先看最影响居住体验的因素，不被次要问题分散注意力。
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-background/80 p-4">
                  <p className="text-sm font-medium text-foreground">判断依据</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    每个结论都能追溯到具体空间条件，而不是一句模糊评价。
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-background/80 p-4">
                  <p className="text-sm font-medium text-foreground">行动建议</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    给你现场核验清单，避免二次跑房或事后后悔。
                  </p>
                </div>
              </div>
            </article>

            <div className="grid gap-6">
              <article className="paper-panel rounded-[2rem] p-6 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="section-kicker">低成本修正</div>
                    <h3 className="mt-3 font-display text-2xl leading-tight">
                      哪些问题能花小钱解决，哪些不值得硬扛。
                    </h3>
                  </div>
                  <Lightbulb className="size-6 text-primary" />
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  用更接近真实租房决策的方式看问题，把窗帘、除湿、隔音、收纳这些可操作手段和预算影响分开写清。
                </p>
              </article>

              <article className="rounded-[2rem] bg-primary px-6 py-7 text-primary-foreground shadow-[0_28px_60px_rgba(45,67,55,0.18)] sm:px-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs tracking-[0.22em] text-primary-foreground/80">
                      沟通话术
                    </div>
                    <h3 className="mt-3 font-display text-2xl leading-tight text-balance">
                      该怎么问房东、怎么压价、怎么确认维修责任。
                    </h3>
                  </div>
                  <MessageSquare className="size-6 text-primary-foreground/85" />
                </div>
                <p className="mt-4 max-w-md text-sm leading-7 text-primary-foreground/78 sm:text-base">
                  报告会把风险转换成更容易开口的沟通句式，让结论不只停在“知道问题”，还能继续推进谈判。
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.92fr]">
          <div className="space-y-5">
            <div className="section-kicker">评估流程</div>
            <h2 className="font-display text-3xl leading-tight text-balance sm:text-4xl">
              输入很短，输出很完整。
            </h2>

            <div className="space-y-4">
              {steps.map((step) => (
                <article key={step.index} className="paper-panel rounded-[1.7rem] p-5 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                        <step.icon className="size-5" />
                      </div>
                      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground sm:hidden">
                        {step.index}
                      </span>
                    </div>
                    <div>
                      <div className="mb-2 hidden text-xs uppercase tracking-[0.24em] text-muted-foreground sm:block">
                        {step.index}
                      </div>
                      <h3 className="font-medium text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] bg-card px-6 py-7 shadow-[0_24px_60px_rgba(95,83,57,0.1)] sm:px-8 sm:py-8">
            <div className="section-kicker">最后一步</div>
            <h2 className="mt-4 font-display text-3xl leading-tight text-balance">
              把看房这件事，从“凭感觉”变成“有依据地筛选”。
            </h2>
            <p className="mt-4 max-w-md text-base leading-8 text-muted-foreground">
              如果你已经在比几个房源，先做一轮预筛会比多看一次房更有效。尤其是当你只能用碎片时间在手机上快速做决定时。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/evaluate">
                <Button className="h-12 rounded-full px-6 text-base">
                  开始生成预筛报告
                  <Sparkles className="size-4" />
                </Button>
              </Link>
              <Link href="/report">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-border bg-background px-6 text-base text-foreground hover:bg-secondary"
                >
                  查看示例结果
                </Button>
              </Link>
            </div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-border/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>SpaceRisk 把租房决策做成一份更可读、更可执行的现场预筛报告。</p>
          <p>适合在看房前快速筛选，也适合在现场补充核验。</p>
        </div>
      </footer>
    </div>
  );
}
