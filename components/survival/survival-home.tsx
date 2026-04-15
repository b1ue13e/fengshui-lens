"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Home, Map, MessagesSquare, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  arrivalWindowOptions,
  housingStatusLabels,
  housingStatusOptions,
  hukouInterestLabels,
  hukouInterestOptions,
  offerStatusLabels,
  offerStatusOptions,
} from "@/lib/survival/config";
import { canGenerateRoutePlan, getRouteWizardValidationError } from "@/lib/survival/flow";
import { clearRoutePlanDraft, readRoutePlanDraft, saveLocalRoutePlan, saveRoutePlanDraft } from "@/lib/survival/local-plans";
import type { RoutePlan, RouteWizardInput } from "@/lib/types/survival-sandbox";

const initialDraft: RouteWizardInput = {
  targetCity: "shanghai",
  originCity: "",
  graduationDate: "2026-06-30",
  offerStatus: "no_offer",
  arrivalWindow: "this_month",
  housingBudget: "",
  hukouInterest: "maybe",
  currentHousingStatus: "campus",
};

const resourceLinks = [
  {
    href: "/categories",
    title: "资源库",
    description: "继续看通用场景、清单和文字版指南。",
    icon: Map,
  },
  {
    href: "/simulator",
    title: "训练场",
    description: "继续练租房、HR、医院和投诉类开口表达。",
    icon: MessagesSquare,
  },
  {
    href: "/rent/tools",
    title: "专项工具",
    description: "保留租房分析、报告和比对工具，适合落地实操。",
    icon: Wrench,
  },
];

const whatYouGetItems = [
  {
    title: "分阶段时间线",
    description: "把签约前、到沪前、第一周、入职后拆开，不再所有事挤成一团。",
    icon: FileText,
  },
  {
    title: "可追责证据卡",
    description: "每个关键步骤都能看到来源、发布日期、复核时间和适用地区。",
    icon: ShieldAlert,
  },
  {
    title: "资源与训练入口",
    description: "资源库、训练场和租房工具还在，但退到辅助层，不抢主流程。",
    icon: BriefcaseBusiness,
  },
];

function ChoiceGrid<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; description: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Single Select</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-[1.4rem] border p-4 text-left transition ${
                active
                  ? "border-[color:color-mix(in_oklab,var(--primary)_32%,white)] bg-[color:color-mix(in_oklab,var(--primary)_11%,white)] shadow-[0_20px_45px_rgba(72,47,22,0.08)]"
                  : "border-border bg-white/72 hover:bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{option.label}</p>
              <p className="mt-2 max-w-[28ch] text-sm leading-6 text-foreground/70">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SurvivalHome() {
  const router = useRouter();
  const [form, setForm] = useState<RouteWizardInput>(() => readRoutePlanDraft(initialDraft));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    saveRoutePlanDraft(form);
  }, [form]);

  const canSubmit = canGenerateRoutePlan(form);

  async function handleSubmit() {
    if (!canSubmit) {
      setErrorMessage(getRouteWizardValidationError(form));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/survival-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        error?: string;
        planId?: string;
        plan?: unknown;
      };

      if (!response.ok || !payload.planId || !payload.plan) {
        throw new Error(payload.error || "路线图生成失败，请稍后再试。");
      }

      saveLocalRoutePlan(payload.plan as RoutePlan);
      clearRoutePlanDraft();

      startTransition(() => {
        router.push(`/survival-plans/${payload.planId}`);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "路线图生成失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <article className="relative overflow-hidden rounded-[2.4rem] border border-black/6 bg-[linear-gradient(140deg,rgba(248,235,216,0.94),rgba(254,249,240,0.9)_42%,rgba(231,241,234,0.78))] p-6 shadow-[0_28px_80px_rgba(70,49,18,0.12)] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.62),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(91,131,110,0.16),transparent_28%)]" />
          <div className="relative">
            <div className="sticker-label">Shanghai Survival Sandbox</div>
            <h1 className="mt-5 max-w-4xl text-balance text-[2.7rem] font-semibold leading-[0.94] text-foreground md:text-[4.6rem]">
              不再背攻略，
              <br />
              先给自己做一份
              <br />
              能活下来的上海路线图。
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-foreground/78">
              这不是一页“毕业生去上海 checklist”，而是把你现在的身份、落地节奏、预算和落户意愿，压成一张带官方来源的行动图。凡是政策性结论，都会把出处、适用地区和复核时间摊开给你看。
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-foreground/75">
              <span className="rounded-full bg-white/72 px-3 py-1">样板城市：上海</span>
              <span className="rounded-full bg-white/72 px-3 py-1">样板画像：外地应届生</span>
              <span className="rounded-full bg-white/72 px-3 py-1">输出形态：强引用路线图</span>
            </div>
          </div>
        </article>

        <aside className="grid gap-4">
          <div className="paper-panel rounded-[2rem] p-5">
            <div className="section-kicker">What You Get</div>
            <div className="mt-5 space-y-4">
              {whatYouGetItems.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] bg-white/76 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-[rgba(84,109,89,0.1)] text-foreground">
                      <item.icon className="size-5" />
                    </div>
                    <p className="text-base font-semibold text-foreground">{item.title}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-foreground/72">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[rgba(135,109,57,0.16)] bg-[linear-gradient(180deg,rgba(255,252,241,0.98),rgba(250,245,226,0.96))] p-5 shadow-[0_18px_46px_rgba(78,59,20,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              这版先做透一城，不伪装成全国通用答案
            </div>
            <p className="mt-3 text-sm leading-7 text-foreground/74">
              当前只支持上海样板。其他城市不会被“猜”成定制路线图，而是明确提示你回到通用资源库学习。
            </p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
        <div className="paper-panel paper-grid rounded-[2.25rem] p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="section-kicker">Route Builder</div>
              <h2 className="mt-4 text-[2rem] font-semibold leading-tight text-foreground">
                6 步录入，换一份可执行的到沪生存图
              </h2>
            </div>
            <div className="rounded-full bg-white/76 px-4 py-2 text-sm text-foreground/72 shadow-[0_10px_24px_rgba(58,42,18,0.08)]">
              当前目标城市固定为上海
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">你从哪座城市出发</label>
                <Input
                  data-testid="survival-origin-city"
                  value={form.originCity}
                  onChange={(event) => setForm((current) => ({ ...current, originCity: event.target.value }))}
                  placeholder="例如：合肥、武汉、南昌"
                  className="h-12 rounded-[1rem] border-border/80 bg-white/80 px-4"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">毕业时间</label>
                <Input
                  data-testid="survival-graduation-date"
                  type="date"
                  value={form.graduationDate}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, graduationDate: event.target.value }))
                  }
                  className="h-12 rounded-[1rem] border-border/80 bg-white/80 px-4"
                />
              </div>
            </div>

            <ChoiceGrid
              label="你和上海这份工作的关系"
              value={form.offerStatus}
              options={offerStatusOptions}
              onChange={(value) => setForm((current) => ({ ...current, offerStatus: value }))}
            />

            <ChoiceGrid
              label="你准备什么时候到上海"
              value={form.arrivalWindow}
              options={arrivalWindowOptions}
              onChange={(value) => setForm((current) => ({ ...current, arrivalWindow: value }))}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">目前能接受的月度住房预算</label>
                <Input
                  data-testid="survival-housing-budget"
                  value={form.housingBudget}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, housingBudget: event.target.value }))
                  }
                  placeholder="例如：3500-4500 元 / 月"
                  className="h-12 rounded-[1rem] border-border/80 bg-white/80 px-4"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">你现在的落脚状态</label>
                <div className="rounded-[1rem] border border-border/80 bg-white/78 p-1.5">
                  <select
                    value={form.currentHousingStatus}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        currentHousingStatus: event.target.value as RouteWizardInput["currentHousingStatus"],
                      }))
                    }
                    className="h-9 w-full bg-transparent px-3 text-sm text-foreground outline-none"
                  >
                    {housingStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs leading-6 text-muted-foreground">
                  当前选择：{housingStatusLabels[form.currentHousingStatus]}
                </p>
              </div>
            </div>

            <ChoiceGrid
              label="你对上海落户这件事的态度"
              value={form.hukouInterest}
              options={hukouInterestOptions}
              onChange={(value) => setForm((current) => ({ ...current, hukouInterest: value }))}
            />

            {errorMessage ? (
              <div className="rounded-[1.4rem] bg-[rgba(198,87,58,0.08)] px-4 py-3 text-sm leading-7 text-[oklch(0.43_0.11_32)]">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="max-w-[48ch] text-sm leading-7 text-foreground/72">
                生成时会优先引用上海官方政策、办事入口和服务问答；没有证据支撑的步骤会被直接标成“待核实”。
              </p>
              <Button
                data-testid="survival-submit"
                type="button"
                size="lg"
                className="h-12 rounded-full px-6"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? "正在排路线图..." : "生成上海路线图"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(246,241,232,0.92))] p-5 shadow-[0_20px_55px_rgba(62,44,18,0.08)]">
            <div className="section-kicker">Current Snapshot</div>
            <div className="mt-5 space-y-4">
              {[
                {
                  label: "出发地",
                  value: form.originCity || "还没填",
                  icon: Home,
                },
                {
                  label: "到沪节奏",
                  value:
                    arrivalWindowOptions.find((item) => item.value === form.arrivalWindow)?.label ??
                    "",
                  icon: Map,
                },
                {
                  label: "工作状态",
                  value: offerStatusLabels[form.offerStatus],
                  icon: BriefcaseBusiness,
                },
                {
                  label: "落户态度",
                  value: hukouInterestLabels[form.hukouInterest],
                  icon: ShieldAlert,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3 rounded-[1.35rem] bg-white/76 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-[1rem] bg-[rgba(87,117,97,0.1)] text-foreground">
                      <item.icon className="size-4" />
                    </div>
                    <span className="text-sm text-foreground/66">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            {resourceLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.8rem] border border-black/6 bg-white/74 p-5 shadow-[0_16px_40px_rgba(70,48,19,0.08)] transition hover:-translate-y-0.5"
              >
                <div className="flex size-12 items-center justify-center rounded-[1.2rem] bg-[rgba(227,235,223,0.9)] text-foreground">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-foreground/72">{item.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/62">
                  打开辅助能力
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
