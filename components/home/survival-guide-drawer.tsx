"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  Cross,
  FileText,
  Home,
  Package,
  Plane,
  ShoppingCart,
  ShieldAlert,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import type { SurvivalLesson } from "@/lib/content/survival-guide";
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

const difficultyLabels: Record<SurvivalLesson["difficulty"], string> = {
  Easy: "轻松上手",
  Medium: "开始有门槛",
  Hard: "重点避坑",
};

type SurvivalGuideDrawerProps = {
  lesson: SurvivalLesson | null;
  open: boolean;
  completed: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleComplete: () => void;
};

export function SurvivalGuideDrawer({
  lesson,
  open,
  completed,
  onOpenChange,
  onToggleComplete,
}: SurvivalGuideDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="w-full max-w-none overflow-y-auto border-l border-border/60 bg-[linear-gradient(180deg,rgba(255,252,246,0.96),rgba(255,248,235,0.98))] p-0 backdrop-blur-2xl sm:w-[min(42rem,100vw)] sm:rounded-l-[2rem]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {lesson ? (
            <DrawerBody
              key={lesson.id}
              lesson={lesson}
              completed={completed}
              onToggleComplete={onToggleComplete}
            />
          ) : null}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  lesson,
  completed,
  onToggleComplete,
}: {
  lesson: SurvivalLesson;
  completed: boolean;
  onToggleComplete: () => void;
}) {
  const Icon = lessonIcons[lesson.icon];

  return (
    <motion.div
      key={lesson.id}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-full flex-col"
    >
      <div className="px-4 pb-8 pt-4 sm:px-6">
        <div className={cn("overflow-hidden rounded-[2rem] p-5 shadow-[0_24px_70px_rgba(84,60,28,0.14)]", accentClasses[lesson.accent])}>
          <div className="flex items-start gap-4 pr-10">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.35rem] bg-white/72 text-foreground shadow-[0_12px_30px_rgba(40,32,20,0.12)]">
              <Icon className="size-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-foreground/72">
                <span className="rounded-full bg-white/68 px-3 py-1">{lesson.category}</span>
                <span className="rounded-full bg-white/68 px-3 py-1">{difficultyLabels[lesson.difficulty]}</span>
                <span className="rounded-full bg-white/68 px-3 py-1">{lesson.estimatedMinutes} 分钟</span>
              </div>
              <h2 className="mt-4 text-balance text-[1.85rem] font-semibold leading-tight text-foreground">
                {lesson.title}
              </h2>
              <p className="mt-3 max-w-[36ch] text-sm leading-7 text-foreground/78">
                {lesson.summary}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-white/68 p-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-foreground/55">
              小白太长不看版
            </p>
            <p className="mt-3 text-sm leading-7 text-foreground/88">{lesson.tldr}</p>
          </div>
        </div>

        <section className="mt-6">
          <div className="flex items-center gap-2">
            <span className="section-kicker">Step-by-step</span>
            <p className="text-sm text-foreground/66">手把手实操步骤</p>
          </div>

          <div className="mt-4 space-y-3">
            {lesson.steps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.04 * index, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[1.6rem] border border-black/6 bg-white/78 p-4 shadow-[0_14px_34px_rgba(71,50,23,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-foreground/76">{step.detail}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[1.8rem] border border-destructive/18 bg-[linear-gradient(180deg,rgba(255,241,239,0.98),rgba(255,247,244,0.96))] p-5 shadow-[0_18px_40px_rgba(157,72,57,0.08)]">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="size-4" />
            <p className="text-sm font-semibold">高阶避坑指南</p>
          </div>
          <div className="mt-4 space-y-3">
            {lesson.proTips.map((tip) => (
              <div key={tip} className="rounded-[1.35rem] bg-white/76 px-4 py-3 text-sm leading-7 text-foreground/82">
                {tip}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center gap-2">
            <span className="section-kicker">Deep Dive</span>
            <p className="text-sm text-foreground/66">想继续深挖就从这里进去</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: index === 0 ? "default" : "outline", size: "sm" }),
                  index === 0 ? "rounded-full px-4" : "rounded-full border-white/70 bg-white/70 px-4"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-border/60 bg-background/92 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-[1.4rem] border px-4 py-3 transition",
              completed
                ? "border-primary/30 bg-primary/10 text-foreground"
                : "border-border/70 bg-white/76 text-foreground/82"
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={completed}
              onChange={onToggleComplete}
            />
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-sm",
                completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground/18 bg-white text-transparent"
              )}
            >
              <CheckCircle2 className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">我已学会</span>
              <span className="block text-xs text-foreground/60">点亮首页卡片和生存进度条</span>
            </span>
          </label>

          <Link
            href={lesson.links[0]?.href ?? "/categories"}
            className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
          >
            去看完整版本
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
