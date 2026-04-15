"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, FileText, LoaderCircle, MapPin, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  arrivalWindowLabels,
  housingStatusLabels,
  hukouInterestLabels,
  offerStatusLabels,
} from "@/lib/survival/config";
import { resolveRoutePlanLoad } from "@/lib/survival/flow";
import { getLocalRoutePlan, saveLocalRoutePlan } from "@/lib/survival/local-plans";
import type { RouteCitation, RoutePlan } from "@/lib/types/survival-sandbox";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function statusBadge(status: RoutePlan["stages"][number]["status"]) {
  switch (status) {
    case "now":
      return "bg-[rgba(89,117,83,0.12)] text-[oklch(0.34_0.05_140)]";
    case "next":
      return "bg-[rgba(195,140,48,0.12)] text-[oklch(0.48_0.08_78)]";
    case "watch":
      return "bg-[rgba(182,87,59,0.12)] text-[oklch(0.45_0.11_31)]";
    default:
      return "bg-[rgba(99,94,82,0.1)] text-[oklch(0.42_0.02_68)]";
  }
}

function statusLabel(status: RoutePlan["stages"][number]["status"]) {
  switch (status) {
    case "now":
      return "现在做";
    case "next":
      return "下一步";
    case "watch":
      return "重点盯";
    default:
      return "先知道";
  }
}

function CitationCard({ citation }: { citation: RouteCitation }) {
  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[1.4rem] border border-black/6 bg-white/80 p-4 transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{citation.documentTitle}</p>
          <p className="mt-1 text-sm leading-6 text-foreground/68">{citation.publisher}</p>
        </div>
        <ArrowUpRight className="mt-0.5 size-4 text-foreground/45" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-foreground/56">
        <span className="rounded-full bg-[rgba(238,233,225,0.92)] px-2.5 py-1">
          发布于 {citation.publishedAt}
        </span>
        <span className="rounded-full bg-[rgba(238,233,225,0.92)] px-2.5 py-1">
          复核于 {citation.reviewedAt}
        </span>
      </div>
      {citation.note ? (
        <p className="mt-3 text-sm leading-6 text-foreground/68">{citation.note}</p>
      ) : null}
    </a>
  );
}

function PlanView({ plan, sourceMode }: { plan: RoutePlan; sourceMode: "local" | "remote" | "hybrid" }) {
  return (
    <div className="space-y-6" data-testid="survival-plan-root">
      <section className="grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
        <article className="hero-panel rounded-[2.4rem] p-6 md:p-8">
          <div className="sticker-label">Route Plan</div>
          <h1 className="mt-5 max-w-3xl text-balance text-[2.5rem] font-semibold leading-[0.95] text-foreground md:text-[4rem]">
            {plan.summary.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/78">{plan.summary.deck}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.6rem] bg-white/72 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-foreground/48">当前最该做</p>
              <p className="mt-3 text-lg font-semibold leading-8 text-foreground">{plan.summary.currentFocus}</p>
            </div>
            <div className="rounded-[1.6rem] bg-white/72 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-foreground/48">先别忽略</p>
              <p className="mt-3 text-sm leading-7 text-foreground/76">{plan.summary.caution}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-foreground/74">
            <span className="rounded-full bg-white/72 px-3 py-1">画像：外地应届生</span>
            <span className="rounded-full bg-white/72 px-3 py-1">
              生成于 {formatDate(plan.generatedAt)}
            </span>
            <span className="rounded-full bg-white/72 px-3 py-1">
              来源模式：{sourceMode === "remote" ? "已同步到云端" : sourceMode === "hybrid" ? "本地 + 云端更新" : "本地优先"}
            </span>
          </div>
        </article>

        <aside className="grid gap-4">
          <div className="paper-panel rounded-[2rem] p-5">
            <div className="section-kicker">User Snapshot</div>
            <div className="mt-5 space-y-3 text-sm text-foreground/78">
              <div className="rounded-[1.3rem] bg-white/76 px-4 py-3">
                <span className="text-foreground/55">出发城市</span>
                <div className="mt-1 font-semibold text-foreground" data-testid="survival-plan-city">
                  {plan.input.originCity}
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-white/76 px-4 py-3">
                <span className="text-foreground/55">工作状态</span>
                <div className="mt-1 font-semibold text-foreground" data-testid="survival-plan-offer-status">
                  {offerStatusLabels[plan.input.offerStatus]}
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-white/76 px-4 py-3">
                <span className="text-foreground/55">到沪节奏</span>
                <div className="mt-1 font-semibold text-foreground">{arrivalWindowLabels[plan.input.arrivalWindow]}</div>
              </div>
              <div className="rounded-[1.3rem] bg-white/76 px-4 py-3">
                <span className="text-foreground/55">住房状态</span>
                <div className="mt-1 font-semibold text-foreground">{housingStatusLabels[plan.input.currentHousingStatus]}</div>
              </div>
              <div className="rounded-[1.3rem] bg-white/76 px-4 py-3">
                <span className="text-foreground/55">落户态度</span>
                <div className="mt-1 font-semibold text-foreground">{hukouInterestLabels[plan.input.hukouInterest]}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/6 bg-white/78 p-5 shadow-[0_18px_46px_rgba(67,48,18,0.08)]">
            <div className="section-kicker">Knowledge Version</div>
            <p className="mt-4 text-base font-semibold text-foreground">{plan.knowledgeVersion}</p>
            <p className="mt-2 text-sm leading-7 text-foreground/72">
              这份路线图只使用当前样板知识库里的上海官方来源；遇到无引用步骤会直接标记“待核实”。
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
        <div className="space-y-4">
          {plan.stages.map((stage, stageIndex) => (
            <section
              key={stage.id}
              className="overflow-hidden rounded-[2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(245,240,231,0.94))] p-5 shadow-[0_18px_46px_rgba(69,48,18,0.08)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                      {stageIndex + 1}
                    </span>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">{stage.label}</h2>
                      <p className="mt-1 max-w-3xl text-sm leading-7 text-foreground/70">{stage.description}</p>
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusBadge(stage.status)}`}>
                  {statusLabel(stage.status)}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {stage.steps.map((step) => (
                  <article key={step.id} className="rounded-[1.6rem] bg-white/82 p-4 shadow-[0_12px_28px_rgba(69,49,20,0.06)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-foreground/74">{step.whyItMatters}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-[rgba(87,116,96,0.1)] px-3 py-1 text-xs font-semibold text-[oklch(0.35_0.05_145)]">
                          可信度 {step.confidence === "high" ? "高" : step.confidence === "medium" ? "中" : "低"}
                        </span>
                        {step.verificationRequired ? (
                          <span className="rounded-full bg-[rgba(188,92,60,0.1)] px-3 py-1 text-xs font-semibold text-[oklch(0.46_0.11_31)]">
                            待核实
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[1.35rem] bg-[rgba(247,244,239,0.9)] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Clock3 className="size-4 text-primary" />
                          触发条件 / 截止点
                        </div>
                        <p className="mt-3 text-sm leading-7 text-foreground/74">{step.deadlineOrTrigger}</p>
                      </div>
                      <div className="rounded-[1.35rem] bg-[rgba(247,244,239,0.9)] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <MapPin className="size-4 text-primary" />
                          需要什么材料
                        </div>
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-foreground/74">
                          {step.requiredMaterials.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.35rem] bg-[rgba(241,247,243,0.92)] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FileText className="size-4 text-primary" />
                        你要做什么
                      </div>
                      <ul className="mt-3 space-y-2 text-sm leading-7 text-foreground/78">
                        {step.actions.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.citations.length ? (
                        step.citations.map((citation) => (
                          <a
                            key={`${citation.sourceId}-${citation.documentId}`}
                            href={citation.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-[rgba(233,229,220,0.92)] px-3 py-1.5 text-xs font-medium text-foreground/76"
                          >
                            来源：{citation.publisher}
                            <ArrowUpRight className="size-3.5" />
                          </a>
                        ))
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(188,92,60,0.08)] px-3 py-1.5 text-xs font-medium text-[oklch(0.46_0.11_31)]">
                          这一步没有稳定引用，先回到官方入口复核
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,239,229,0.95))] p-5 shadow-[0_18px_48px_rgba(69,48,18,0.08)]">
            <div className="section-kicker">Source Deck</div>
            <div className="mt-5 space-y-3">
              {plan.supportingSources.map((citation) => (
                <CitationCard key={`${citation.sourceId}-${citation.documentId}`} citation={citation} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/6 bg-white/80 p-5 shadow-[0_18px_42px_rgba(66,47,18,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldAlert className="size-4 text-primary" />
              这版路线图没有做的事
            </div>
            <p className="mt-3 text-sm leading-7 text-foreground/72">
              本期不做 OCR 合同识别，也不做实时对决 Agent。它先把知识证据层立住，让后面的训练场和工具调用同一套来源。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/">
                <Button variant="outline">重做一份输入</Button>
              </Link>
              <Link href="/simulator">
                <Button>去训练场</Button>
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function SurvivalPlanPage({ planId }: { planId: string }) {
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [sourceMode, setSourceMode] = useState<"local" | "remote" | "hybrid">("local");

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      const localPlan = getLocalRoutePlan(planId);

      const localOutcome = resolveRoutePlanLoad({ localPlan, remotePlan: null });

      if (localOutcome.plan && active) {
        setPlan(localOutcome.plan);
        setState(localOutcome.state);
        setSourceMode(localOutcome.sourceMode);
      }

      try {
        const response = await fetch(`/api/survival-plans/${planId}`, { cache: "no-store" });

        if (!response.ok) {
          if (!localPlan && active) {
            setState("missing");
          }
          return;
        }

        const payload = (await response.json()) as { plan?: RoutePlan };

        if (!payload.plan || !active) {
          return;
        }

        const resolved = resolveRoutePlanLoad({
          localPlan,
          remotePlan: payload.plan,
        });

        if (resolved.shouldPersistRemotePlan) {
          saveLocalRoutePlan(payload.plan);
        }

        setPlan(resolved.plan);
        setState(resolved.state);
        setSourceMode(resolved.sourceMode);
      } catch {
        if (!localPlan && active) {
          setState("missing");
        }
      }
    }

    loadPlan();

    return () => {
      active = false;
    };
  }, [planId]);

  if (state === "loading") {
    return (
      <div className="paper-panel flex min-h-[40vh] items-center justify-center rounded-[2rem] p-8">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm leading-7 text-foreground/72">正在把你的上海路线图从本地或云端取回来...</p>
        </div>
      </div>
    );
  }

  if (!plan || state === "missing") {
    return (
      <EmptyState
        title="这份路线图暂时没找到"
        description="游客模式下路线图默认先存本地；如果你换了设备或清过缓存，需要重新生成一份。"
        actionLabel="回首页重新生成"
        actionHref="/"
      />
    );
  }

  return <PlanView plan={plan} sourceMode={sourceMode} />;
}
