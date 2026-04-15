"use client";

import Link from "next/link";
import { ArrowLeft, Bookmark, CheckCircle2, Share2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { ScenarioCard } from "@/components/scenario/scenario-card";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_LABELS, STAGE_LABELS } from "@/lib/content/seed";
import { useAppStore } from "@/lib/store/app-store";
import type { ScenarioCard as ScenarioCardType, ScenarioDetail } from "@/lib/types/young-study";

export function ScenarioDetailScreen({
  scenario,
  related,
}: {
  scenario: ScenarioDetail;
  related: ScenarioCardType[];
}) {
  const favorites = useAppStore((state) => state.favorites);
  const completed = useAppStore((state) => state.completed);
  const checklistState = useAppStore((state) => state.checklistState[scenario.checklist.id] ?? {});
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const markScenarioComplete = useAppStore((state) => state.markScenarioComplete);
  const recordRecentView = useAppStore((state) => state.recordRecentView);
  const updateChecklistState = useAppStore((state) => state.updateChecklistState);
  const pushToast = useAppStore((state) => state.pushToast);
  const [selectedQuizOption, setSelectedQuizOption] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  const isFavorited = favorites.includes(scenario.slug);
  const isCompleted = completed.includes(scenario.slug);

  useEffect(() => {
    recordRecentView(scenario.slug);
  }, [recordRecentView, scenario.slug]);

  return (
    <div className="space-y-8">
      <div className={`hero-panel cover-${scenario.coverStyle} rounded-[2rem] p-5 md:p-7`}>
        <Link href="/categories" className="inline-flex items-center gap-2 text-sm text-foreground/72">
          <ArrowLeft className="size-4" />
          返回分类
        </Link>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-white/60 bg-white/65 text-foreground">
            {scenario.categoryName}
          </Badge>
          <Badge variant="outline" className="border-white/60 bg-white/65 text-foreground">
            {DIFFICULTY_LABELS[scenario.difficulty]}
          </Badge>
          <Badge variant="outline" className="border-white/60 bg-white/65 text-foreground">
            {scenario.estimatedMinutes} 分钟
          </Badge>
        </div>

        <h1 className="mt-4 max-w-3xl text-balance text-[2rem] font-semibold leading-tight md:text-[3rem]">
          {scenario.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-foreground/78 md:text-base">
          {scenario.summary}
        </p>
        <p className="mt-3 max-w-3xl rounded-[1.2rem] bg-white/62 px-4 py-3 text-sm text-foreground/82">
          {scenario.oneLiner}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={isFavorited ? "secondary" : "default"}
            onClick={() => {
              toggleFavorite(scenario.slug);
              pushToast(isFavorited ? "已取消收藏" : "已收藏场景", scenario.title);
            }}
          >
            <Bookmark className={`size-4 ${isFavorited ? "fill-current" : ""}`} />
            {isFavorited ? "已收藏" : "收藏"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={isCompleted ? "secondary" : "outline"}
            onClick={() => {
              markScenarioComplete(scenario.slug, !isCompleted);
              pushToast(isCompleted ? "已取消完成" : "已标记完成", isCompleted ? undefined : "你已经把这一页学完了。");
            }}
          >
            <CheckCircle2 className={`size-4 ${isCompleted ? "fill-current" : ""}`} />
            {isCompleted ? "已完成" : "标记完成"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const url = window.location.href;
                const canShare = typeof navigator.share === "function";
                if (canShare) {
                  await navigator.share({ title: scenario.title, text: scenario.summary, url });
                } else {
                  await navigator.clipboard.writeText(url);
                }
                pushToast("已准备好分享", canShare ? "你可以把这页发给朋友。" : "链接已经复制到剪贴板。");
              });
            }}
          >
            <Share2 className="size-4" />
            分享
          </Button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="soft-panel rounded-[1.8rem] p-5">
          <p className="sticker-label">适合谁看</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/82">
            {scenario.targetUsers.map((user) => (
              <li key={user} className="rounded-[1.2rem] bg-background/70 px-3 py-2">
                {user}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            {scenario.targetStages.map((stage) => (
              <span key={stage} className="rounded-full bg-muted px-3 py-1 text-xs text-secondary-foreground">
                {STAGE_LABELS[stage]}
              </span>
            ))}
          </div>
        </article>

        <article className="soft-panel rounded-[1.8rem] p-5">
          <p className="sticker-label">你将学会什么</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/82">
            {scenario.whatYouWillLearn.map((item) => (
              <li key={item} className="rounded-[1.2rem] bg-background/70 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">去之前先准备</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {scenario.preparationItems.map((item) => (
            <div key={item} className="soft-panel rounded-[1.4rem] px-4 py-3 text-sm text-foreground/82">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">按这个顺序做</h2>
        <div className="space-y-4">
          {scenario.steps.map((step, index) => (
            <article key={step.id} className="soft-panel rounded-[1.8rem] p-5">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{step.body}</p>
                  {step.tip ? (
                    <p className="rounded-[1rem] bg-background/70 px-3 py-2 text-sm text-foreground/82">
                      小提醒：{step.tip}
                    </p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="soft-panel rounded-[1.8rem] p-5">
          <h2 className="text-xl font-semibold text-foreground">这些坑别硬踩</h2>
          <div className="mt-4 space-y-3">
            {scenario.pitfallItems.map((item) => (
              <p key={item} className="rounded-[1.2rem] bg-destructive/7 px-3 py-3 text-sm leading-6 text-foreground/82">
                {item}
              </p>
            ))}
          </div>
        </article>

        <article className="soft-panel rounded-[1.8rem] p-5">
          <h2 className="text-xl font-semibold text-foreground">常见问题</h2>
          <div className="mt-4 space-y-3">
            {scenario.faqs.map((faq) => (
              <details key={faq.id} className="rounded-[1.2rem] bg-background/70 px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <article className="soft-panel rounded-[1.8rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">真实话术模板</h2>
            <CopyButton
              value={scenario.scripts.map((item) => `${item.title}\n${item.content}`).join("\n\n")}
              label="一键复制全部"
            />
          </div>
          <div className="mt-4 space-y-4">
            {scenario.scripts.map((script) => (
              <div key={script.id} className="rounded-[1.4rem] bg-background/72 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{script.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{script.content}</p>
                  </div>
                  <CopyButton value={script.content} label="复制" className="shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="soft-panel rounded-[1.8rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">{scenario.checklist.title}</h2>
            <CopyButton
              value={scenario.checklist.items.map((item) => `- ${item.content}`).join("\n")}
              label="复制清单"
            />
          </div>
          <div className="mt-4 space-y-3">
            {scenario.checklist.items.map((item) => {
              const checked = checklistState[item.id] ?? false;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`flex w-full items-start gap-3 rounded-[1.2rem] px-3 py-3 text-left text-sm transition ${
                    checked ? "bg-primary/10 text-foreground" : "bg-background/72 text-foreground/82"
                  }`}
                  onClick={() => updateChecklistState(scenario.checklist.id, item.id, !checked)}
                >
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span>{item.content}</span>
                </button>
              );
            })}
          </div>
        </article>
      </section>

      <section className="soft-panel rounded-[1.8rem] p-5">
        <h2 className="text-xl font-semibold text-foreground">学完自测</h2>
        <div className="mt-4 space-y-5">
          {scenario.quiz.map((quiz) => {
            const answer = selectedQuizOption[quiz.id];

            return (
              <div key={quiz.id} className="rounded-[1.4rem] bg-background/72 p-4">
                <p className="text-sm font-semibold text-foreground">{quiz.question}</p>
                <div className="mt-3 grid gap-2">
                  {quiz.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      className={`rounded-[1rem] px-3 py-3 text-left text-sm ${
                        answer === index
                          ? index === quiz.correctAnswer
                            ? "bg-primary/12 text-foreground"
                            : "bg-destructive/8 text-foreground"
                          : "bg-card text-foreground/82"
                      }`}
                      onClick={() =>
                        setSelectedQuizOption((current) => ({
                          ...current,
                          [quiz.id]: index,
                        }))
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {typeof answer === "number" ? (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{quiz.explanation}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {related.length ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">你下一步可能会接着看</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <ScenarioCard key={item.slug} scenario={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
