"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { startTransition, useState } from "react";

import { submitFeedback } from "@/app/actions/young-study";
import { PathCard } from "@/components/paths/path-card";
import { ScenarioCard } from "@/components/scenario/scenario-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ToolkitCard } from "@/components/toolkit/toolkit-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { STAGE_LABELS } from "@/lib/content/seed";
import { useAppStore } from "@/lib/store/app-store";
import type { LearningPath, ScenarioCard as ScenarioCardType, ToolkitResource } from "@/lib/types/young-study";

export function ProfileScreen({
  scenarioCards,
  learningPaths,
  toolkitResources,
}: {
  scenarioCards: ScenarioCardType[];
  learningPaths: LearningPath[];
  toolkitResources: ToolkitResource[];
}) {
  const favorites = useAppStore((state) => state.favorites);
  const completed = useAppStore((state) => state.completed);
  const recent = useAppStore((state) => state.recent);
  const savedToolkits = useAppStore((state) => state.savedToolkits);
  const onboardingStage = useAppStore((state) => state.onboardingStage);
  const pushToast = useAppStore((state) => state.pushToast);
  const [feedback, setFeedback] = useState("");

  const favoriteCards = scenarioCards.filter((item) => favorites.includes(item.slug));
  const completedCards = scenarioCards.filter((item) => completed.includes(item.slug));
  const recentCards = recent
    .map((slug) => scenarioCards.find((item) => item.slug === slug))
    .filter(Boolean) as ScenarioCardType[];
  const savedToolkitCards = toolkitResources.filter((item) => savedToolkits.includes(item.slug));

  return (
    <div className="space-y-8">
      <section className="hero-panel rounded-[2rem] p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="sticker-label">个人中心</div>
            <h1 className="mt-4 text-[2rem] font-semibold leading-tight text-foreground">你正在一点点把社会生活学会</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/78">
              这里会记住你的学习记录、收藏、已完成场景和路线进度。登录后还能同步到云端。
            </p>
            {onboardingStage ? (
              <p className="mt-3 rounded-full bg-white/68 px-4 py-2 text-sm text-foreground/82">
                当前路线偏好：{STAGE_LABELS[onboardingStage]}
              </p>
            ) : null}
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-foreground/82">
          <span className="rounded-full bg-white/68 px-3 py-1">收藏 {favoriteCards.length}</span>
          <span className="rounded-full bg-white/68 px-3 py-1">完成 {completedCards.length}</span>
          <span className="rounded-full bg-white/68 px-3 py-1">最近学习 {recentCards.length}</span>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="最近学习" description="刚刚看过的内容在这里，重新继续最省力。" />
        {recentCards.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentCards.slice(0, 3).map((card) => (
              <ScenarioCard key={card.slug} scenario={card} compact />
            ))}
          </div>
        ) : (
          <EmptyState title="你还没有最近学习记录" description="去首页点开一个场景，系统就会自动记住。" actionLabel="去首页看看" actionHref="/" />
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading title="收藏内容" description="你觉得以后还会再看的场景，都会留在这里。" />
        {favoriteCards.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favoriteCards.map((card) => (
              <ScenarioCard key={card.slug} scenario={card} compact />
            ))}
          </div>
        ) : (
          <EmptyState title="还没有收藏" description="看到想留着以后复习的场景，记得点一下收藏。" actionLabel="去看看高频场景" actionHref="/" />
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading title="学习路径进度" description="如果你更喜欢按阶段学，这里能看到路线进度。" />
        <div className="grid gap-4 lg:grid-cols-2">
          {learningPaths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="收藏的工具箱" description="能直接复制和下载的模板，会在这里继续等你。" />
        {savedToolkitCards.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {savedToolkitCards.map((item) => (
              <ToolkitCard key={item.slug} resource={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="工具箱还没收藏内容" description="你可以去工具箱页把常用模板先收起来。" actionLabel="打开工具箱" actionHref="/toolkit" />
        )}
      </section>

      <section className="soft-panel rounded-[1.8rem] p-5">
        <SectionHeading title="意见反馈" description="哪里看不懂、哪里想补充、哪些场景还缺，直接写给我们。" />
        <div className="mt-4 space-y-3">
          <Textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="比如：我想看“第一次去派出所办居住证”或“合租室友纠纷怎么处理”。"
            className="min-h-28 rounded-[1.2rem] bg-background/70"
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  const currentFeedback = feedback.trim();
                  if (!currentFeedback) {
                    return;
                  }
                  const result = await submitFeedback({
                    message: currentFeedback,
                    page: "/profile",
                  });
                  setFeedback("");
                  pushToast(
                    result.ok ? "反馈已记录" : "反馈暂时没发出去",
                    result.ok ? "谢谢你帮我们补洞，这会让内容越做越准。" : "你可以稍后再试一次。"
                  );
                })
              }
              disabled={!feedback.trim()}
            >
              提交反馈
            </Button>
            <Link href="/login">
              <Button type="button" variant="outline">
                <Mail className="size-4" />
                登录并同步
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
