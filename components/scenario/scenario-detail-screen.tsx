"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Clock,
  Signal,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Star,
  Heart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { DIFFICULTY_LABELS } from "@/lib/content/seed";
import type { ScenarioCard as ScenarioCardType, ScenarioDetail } from "@/lib/types/content";

const EMPTY_CHECKLIST_STATE: Record<string, boolean> = {};

export function ScenarioDetailScreen({
  scenario,
  related,
}: {
  scenario: ScenarioDetail;
  related: ScenarioCardType[];
}) {
  const favorites = useAppStore((state) => state.favorites);
  const completed = useAppStore((state) => state.completed);
  const checklistMap = useAppStore((state) => state.checklistState);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const markScenarioComplete = useAppStore((state) => state.markScenarioComplete);
  const recordRecentView = useAppStore((state) => state.recordRecentView);
  const updateChecklistState = useAppStore((state) => state.updateChecklistState);
  const pushToast = useAppStore((state) => state.pushToast);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  const isFav = favorites.includes(scenario.slug);
  const isComplete = completed.includes(scenario.slug);
  const checklistState = checklistMap[scenario.checklist.id] ?? EMPTY_CHECKLIST_STATE;

  useEffect(() => {
    recordRecentView(scenario.slug);
  }, [recordRecentView, scenario.slug]);

  const quizScore = () => {
    let correct = 0;
    scenario.quiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++;
    });
    return { correct, total: scenario.quiz.length };
  };

  const targetAudience = scenario.targetUsers.slice(0, 2).join(" / ") || "现实高频场景";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/" className="flex items-center gap-1 hover:text-neutral-900"><Home className="h-4 w-4" /> 首页</Link>
        <span>/</span>
        <Link href={`/categories/${scenario.categorySlug}`} className="hover:text-neutral-900">{scenario.categoryName}</Link>
        <span>/</span>
        <span>{scenario.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">{scenario.title}</h1>
          <p className="text-neutral-500">{scenario.summary}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {scenario.estimatedMinutes} 分钟</span>
            <span className="flex items-center gap-1"><Signal className="h-3 w-3" /> {DIFFICULTY_LABELS[scenario.difficulty]}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {targetAudience}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toggleFavorite(scenario.slug);
            pushToast(isFav ? "已取消收藏" : "已加入收藏", scenario.title);
          }}
        >
          <Heart className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : "text-neutral-400"}`} />
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-neutral-900"><BookOpen className="h-5 w-5" />场景简介</h2>
        <p className="leading-relaxed text-neutral-700">{scenario.oneLiner || scenario.summary}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 font-bold text-neutral-900">你会学到什么</h2>
        <p className="text-neutral-700">{scenario.whatYouWillLearn.join("；")}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 font-bold text-neutral-900">去之前先准备</h2>
        <p className="text-neutral-700">{scenario.preparationItems.join("；")}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 font-bold text-neutral-900">按步骤怎么做</h2>
        <ol className="space-y-3">
          {scenario.steps.map((step, i) => (
            <li key={step.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-neutral-900">{step.title}</p>
                <p className="mt-1 text-neutral-700">{step.body}</p>
                {step.tip ? <p className="mt-1 text-sm text-neutral-500">小提醒：{step.tip}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {scenario.pitfallItems.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-neutral-900"><AlertTriangle className="h-5 w-5 text-amber-500" />常见坑</h2>
          <ul className="space-y-2">
            {scenario.pitfallItems.map((p, i) => (
              <li key={`${p}-${i}`} className="flex items-start gap-2 text-neutral-700">
                <span className="mt-1 text-amber-500">›</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {scenario.faqs.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-bold text-neutral-900">FAQ</h2>
          <div className="space-y-4">
            {scenario.faqs.map((item) => (
              <div key={item.id}>
                <p className="mb-1 font-medium text-neutral-900">Q: {item.question}</p>
                <p className="text-sm text-neutral-600">A: {item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {scenario.scripts.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-bold text-neutral-900">可复制话术</h2>
          <div className="space-y-4">
            {scenario.scripts.map((s) => (
              <div key={s.id} className="rounded-lg bg-neutral-50 p-4">
                <p className="mb-1 text-sm font-medium text-neutral-700">{s.title}</p>
                <p className="text-sm italic text-neutral-600">“{s.content}”</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {scenario.checklist.items.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-neutral-900"><CheckCircle2 className="h-5 w-5" />核对清单</h2>
          <div className="space-y-2">
            {scenario.checklist.items.map((item, i) => {
              const checked = checklistState[item.id] ?? false;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <input
                    id={`check-${i}`}
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => updateChecklistState(scenario.checklist.id, item.id, event.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`check-${i}`} className="cursor-pointer text-sm text-neutral-700">{item.content}</label>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {scenario.quiz.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-neutral-900"><Star className="h-5 w-5" />小测验</h2>
          {!showQuiz ? (
            <Button variant="outline" className="border-neutral-300" onClick={() => setShowQuiz(true)}>
              开始测验
            </Button>
          ) : (
            <div className="space-y-4">
              {scenario.quiz.map((q, i) => (
                <div key={q.id}>
                  <p className="mb-2 font-medium text-neutral-900">{i + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2 rounded-md p-2 ${
                          quizAnswers[i] === j ? "bg-neutral-100" : "hover:bg-neutral-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${i}`}
                          className="h-4 w-4"
                          onChange={() => setQuizAnswers((prev) => ({ ...prev, [i]: j }))}
                        />
                        <span className="text-sm text-neutral-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                className="bg-neutral-900 hover:bg-neutral-800"
                onClick={() => {
                  const { correct, total } = quizScore();
                  if (correct === total) markScenarioComplete(scenario.slug, true);
                  pushToast(`答对 ${correct}/${total}`, correct === total ? "已自动标记完成。" : "再回看一遍关键步骤。");
                }}
              >
                提交答案
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {related.length > 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-3 font-bold text-neutral-900">相关推荐</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Link key={item.slug} href={`/scenario/${item.slug}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-neutral-100">{item.title}</Badge>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Link href={`/categories/${scenario.categorySlug}`}>
          <Button variant="ghost" className="gap-2"><ArrowLeft className="h-4 w-4" /> 返回分类</Button>
        </Link>
        {!isComplete ? (
          <Button
            variant="outline"
            className="gap-2 border-neutral-300"
            onClick={() => markScenarioComplete(scenario.slug, true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            标记完成
          </Button>
        ) : (
          <Badge className="border-green-200 bg-green-100 text-green-700">
            <CheckCircle2 className="mr-1 h-3 w-3" /> 已完成
          </Badge>
        )}
      </div>
    </div>
  );
}