"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  BookOpenCheck,
  Briefcase,
  Cross,
  FileText,
  Home,
  MessagesSquare,
  Package,
  Plane,
  ShoppingCart,
  Sparkles,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { SurvivalGuideDrawer } from "@/components/home/survival-guide-drawer";
import { Progress } from "@/components/ui/progress";
import {
  getSurvivalRank,
  survivalFilters,
  type SurvivalFilter,
  type SurvivalLesson,
} from "@/lib/content/survival-guide";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";

const lessonIcons: Record<SurvivalLesson["icon"], LucideIcon> = {
  Home,
  Briefcase,
  Banknote,
  Wifi,
  Cross,
  Plane,
  Package,
  FileText,
  ShoppingCart,
};

const accentClasses: Record<SurvivalLesson["accent"], string> = {
  amber: "cover-amber",
  peach: "cover-peach",
  mint: "cover-mint",
  sky: "cover-sky",
  rose: "cover-rose",
  sand: "cover-sand",
};

const difficultyLevels: Record<SurvivalLesson["difficulty"], number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

const difficultyLabels: Record<SurvivalLesson["difficulty"], string> = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

const filterDescriptions: Record<SurvivalFilter, string> = {
  全部: "先把最容易马上遇到的 9 节生存课过一遍，你的独立感会涨得比想象中快。",
  职场修炼: "从 offer、三方到工资条，别让自己第一份工作全靠猜。",
  生活起居: "把租房、看病、缴费、寄快递这些真问题先踩熟，独立就没那么慌。",
  出行指南: "第一次独自去更远的地方，流程感会比勇敢更重要。",
};

const quickLinks = [
  {
    title: "刷完整知识库",
    description: "如果你想按分类系统学，现在的项目已经有分类页和 30+ 场景。",
    href: "/categories",
    icon: BookOpenCheck,
    tone: "bg-[linear-gradient(135deg,rgba(255,236,214,0.95),rgba(252,228,196,0.92))]",
  },
  {
    title: "练对话和应对",
    description: "模拟器已经能帮你练银行、租房、医院、快递投诉这些真实开口场景。",
    href: "/simulator",
    icon: MessagesSquare,
    tone: "bg-[linear-gradient(135deg,rgba(223,240,248,0.95),rgba(205,228,245,0.92))]",
  },
  {
    title: "打开租房工具",
    description: "高级租房评估、对比和报告功能也还在，适合继续往实操深挖。",
    href: "/rent/tools",
    icon: Wrench,
    tone: "bg-[linear-gradient(135deg,rgba(228,244,222,0.95),rgba(208,236,194,0.92))]",
  },
];

export function HomeScreen({ lessons }: { lessons: SurvivalLesson[] }) {
  const completed = useAppStore((state) => state.completed);
  const markScenarioComplete = useAppStore((state) => state.markScenarioComplete);
  const recordRecentView = useAppStore((state) => state.recordRecentView);
  const pushToast = useAppStore((state) => state.pushToast);

  const [activeFilter, setActiveFilter] = useState<SurvivalFilter>("全部");
  const [selectedLesson, setSelectedLesson] = useState<SurvivalLesson | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const completedSet = useMemo(() => new Set(completed), [completed]);

  const filteredLessons =
    activeFilter === "全部"
      ? lessons
      : lessons.filter((lesson) => lesson.category === activeFilter);

  const completedCount = lessons.filter((lesson) => completedSet.has(lesson.progressSlug)).length;
  const progressValue = Math.round((completedCount / lessons.length) * 100);
  const currentRank = getSurvivalRank(progressValue);
  const selectedCompleted = selectedLesson ? completedSet.has(selectedLesson.progressSlug) : false;

  const handleLessonOpen = (lesson: SurvivalLesson) => {
    setSelectedLesson(lesson);
    setDrawerOpen(true);
    recordRecentView(lesson.progressSlug);
  };

  const toggleSelectedLesson = () => {
    if (!selectedLesson) {
      return;
    }

    const nextCompleted = !completedSet.has(selectedLesson.progressSlug);
    markScenarioComplete(selectedLesson.progressSlug, nextCompleted);
    pushToast(
      nextCompleted ? "生存技能已点亮" : "已取消本次点亮",
      nextCompleted ? `${selectedLesson.title} 已加入你的掌握进度。` : undefined
    );
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.3rem] border border-black/6 bg-[linear-gradient(135deg,rgba(255,244,219,0.96),rgba(255,232,194,0.9)_54%,rgba(255,249,238,0.92))] p-6 shadow-[0_28px_80px_rgba(73,52,18,0.12)] md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.48),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,211,83,0.22),transparent_28%)]" />
          <div className="relative">
            <div className="sticker-label">青年社会生存指南</div>
            <h1 className="mt-5 max-w-3xl text-balance text-[2.4rem] font-semibold leading-[0.97] md:text-[4rem]">
              真正的独立，
              <br />
              不是搬出宿舍，
              <br />
              是第一次也知道该怎么做。
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-foreground/78 md:text-base">
              这个项目现在已经是一套完成度很高的青年生存 MVP，包含分类知识库、场景详情、学习路径、模拟器、工具箱和租房高级工具。
              这次首页升级的重点，是把最重要的那 9 节课做成一套更像“社会落地训练营”的入口。
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-foreground/78">
              <span className="rounded-full bg-white/72 px-3 py-1">五险一金不再是黑箱</span>
              <span className="rounded-full bg-white/72 px-3 py-1">租房押金少踩雷</span>
              <span className="rounded-full bg-white/72 px-3 py-1">第一次去医院也不慌</span>
            </div>
          </div>
        </motion.article>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2.3rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(248,241,229,0.94))] p-6 shadow-[0_24px_60px_rgba(58,42,22,0.1)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,219,117,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(145,188,160,0.12),transparent_32%)]" />
          <div className="relative">
            <div className="section-kicker">Survival Progress</div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/62">当前称号</p>
                <h2 className="mt-2 text-[1.7rem] font-semibold leading-tight text-foreground">
                  {currentRank}
                </h2>
              </div>
              <div className="rounded-[1.4rem] bg-black px-4 py-3 text-right text-background shadow-[0_18px_36px_rgba(34,26,14,0.18)]">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-background/62">已掌握</p>
                <p className="mt-1 text-2xl font-semibold">
                  {completedCount}/{lessons.length}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 text-sm">
              <p className="font-semibold text-foreground">社会生存进度</p>
              <p className="text-foreground/64">{progressValue}%</p>
            </div>
            <Progress
              value={progressValue}
              className="mt-2 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-[linear-gradient(90deg,rgba(43,34,19,1),rgba(237,176,66,1))] [&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-track]]:bg-black/8"
            />

            <p className="mt-4 text-sm leading-7 text-foreground/72">
              你每点亮一张卡，首页课程状态、称号和底层学习进度都会一起更新，不再只是“看过了”，而是真的有了通关感。
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[1.3rem] bg-white/72 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-foreground/48">核心课</p>
                <p className="mt-2 text-lg font-semibold text-foreground">9 节必修</p>
              </div>
              <div className="rounded-[1.3rem] bg-white/72 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-foreground/48">学习方式</p>
                <p className="mt-2 text-lg font-semibold text-foreground">抽屉式速学</p>
              </div>
            </div>
          </div>
        </motion.aside>
      </section>

      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[1.8rem] border border-black/6 bg-white/64 p-3 shadow-[0_18px_40px_rgba(75,57,26,0.08)] backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center gap-2">
            {survivalFilters.map((filter) => {
              const active = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active
                      ? "bg-foreground text-background shadow-[0_14px_28px_rgba(41,32,17,0.22)]"
                      : "bg-transparent text-foreground/68 hover:bg-black/6 hover:text-foreground"
                  )}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          <p className="mt-3 px-1 text-sm leading-7 text-foreground/66">
            {filterDescriptions[activeFilter]}
          </p>
        </motion.div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {activeFilter === "全部" ? "9 张核心生存课程卡" : `${activeFilter} · ${filteredLessons.length} 张核心卡`}
            </p>
            <p className="mt-1 text-sm text-foreground/60">
              点击卡片直接学，不用切来切去找页面。
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-sm text-foreground/68 shadow-[0_10px_24px_rgba(64,46,19,0.08)] md:inline-flex">
            <Sparkles className="size-4 text-primary" />
            课程学完会自动点亮
          </div>
        </div>

        <motion.div
          layout
          className="grid auto-rows-[minmax(18rem,auto)] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredLessons.map((lesson, index) => {
              const Icon = lessonIcons[lesson.icon];
              const isCompleted = completedSet.has(lesson.progressSlug);

              return (
                <motion.button
                  layout
                  key={lesson.id}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.24, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleLessonOpen(lesson)}
                  className={cn(
                    "group relative overflow-hidden rounded-[2rem] border p-5 text-left shadow-[0_24px_60px_rgba(64,46,19,0.1)] backdrop-blur-xl transition",
                    getBentoClass(lesson.id),
                    isCompleted
                      ? "border-[rgba(214,164,53,0.52)] bg-[linear-gradient(180deg,rgba(255,251,236,0.98),rgba(255,245,214,0.94))]"
                      : "border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(249,243,232,0.86))]"
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.48),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,212,111,0.16),transparent_26%)] opacity-80" />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className={cn("rounded-[1.45rem] p-4 shadow-[0_14px_34px_rgba(47,37,18,0.1)]", accentClasses[lesson.accent])}>
                        <div className="flex size-12 items-center justify-center rounded-[1.1rem] bg-white/72 text-foreground">
                          <Icon className="size-6" />
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="rounded-full bg-[rgba(214,164,53,0.16)] px-3 py-1 text-xs font-semibold text-[rgb(121,88,19)]">
                          已点亮
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
                        {lesson.category}
                      </p>
                      <h2 className="mt-3 max-w-[16ch] text-balance text-[1.45rem] font-semibold leading-tight text-foreground">
                        {lesson.title}
                      </h2>
                      <p className="mt-3 max-w-[34ch] text-sm leading-7 text-foreground/74">
                        {lesson.summary}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/74 px-3 py-1 text-xs font-medium text-foreground/72">
                        {Array.from({ length: 3 }).map((_, starIndex) => (
                          <span
                            key={`${lesson.id}-${starIndex}`}
                            className={cn(
                              "text-[0.72rem]",
                              starIndex < difficultyLevels[lesson.difficulty]
                                ? "text-[rgb(177,129,33)]"
                                : "text-foreground/24"
                            )}
                          >
                            ★
                          </span>
                        ))}
                        {difficultyLabels[lesson.difficulty]}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/74 px-3 py-1 text-xs text-foreground/68">
                        {lesson.estimatedMinutes} 分钟
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-foreground/62 transition group-hover:text-foreground">
                        点开速学
                        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {quickLinks.map((item, index) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.18 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={item.href}
              className="group block overflow-hidden rounded-[1.9rem] border border-black/6 bg-white/70 p-5 shadow-[0_18px_40px_rgba(69,50,24,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5"
            >
              <div className={cn("rounded-[1.5rem] p-4", item.tone)}>
                <div className="flex size-11 items-center justify-center rounded-[1.15rem] bg-white/74 text-foreground">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 max-w-[30ch] text-sm leading-7 text-foreground/72">
                  {item.description}
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/64 transition group-hover:text-foreground">
                保留现有能力继续深入
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      <SurvivalGuideDrawer
        lesson={selectedLesson}
        open={drawerOpen}
        completed={selectedCompleted}
        onOpenChange={setDrawerOpen}
        onToggleComplete={toggleSelectedLesson}
      />
    </div>
  );
}

function getBentoClass(id: number) {
  switch (id) {
    case 1:
    case 2:
    case 8:
      return "lg:col-span-2";
    default:
      return "";
  }
}
