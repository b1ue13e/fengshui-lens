"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store/app-store";
import type { TargetStage } from "@/lib/types/young-study";

const stageOptions: Array<{
  stage: TargetStage;
  label: string;
  description: string;
}> = [
  { stage: "freshman", label: "我是大一新生", description: "想先把离家后的办事和生活小技能补齐。" },
  { stage: "independent", label: "我在学独立生活", description: "想把租房、洗衣、缴费、寄件这些先跑顺。" },
  { stage: "intern", label: "我准备第一次实习", description: "想把面试、工资、试用期这些搞明白。" },
  { stage: "graduate", label: "我在找工作/刚毕业", description: "想重点看三方、补贴、五险一金和合同。" },
  { stage: "new-city", label: "我刚到陌生城市", description: "想先搞懂交通、租房、医院和求助入口。" },
];

export function OnboardingSheet() {
  const onboardingCompleted = useAppStore((state) => state.onboardingCompleted);
  const setOnboardingStage = useAppStore((state) => state.setOnboardingStage);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const pushToast = useAppStore((state) => state.pushToast);
  const [dismissed, setDismissed] = useState(false);
  const open = !onboardingCompleted && !dismissed;

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => setDismissed(!nextOpen)}>
      <SheetContent side="bottom" className="rounded-t-[2rem] border-t border-border/80 bg-background px-0 pb-6">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="text-xl font-semibold">先帮你切到合适路线</SheetTitle>
          <SheetDescription className="leading-6">
            选一个最接近你现在状态的身份，我们会先把首页和学习路径排给你最需要的内容。
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 px-5 pt-3">
          {stageOptions.map((option) => (
            <button
              key={option.stage}
              type="button"
              className="soft-panel rounded-[1.4rem] p-4 text-left transition-transform hover:-translate-y-0.5"
              onClick={() => {
                setOnboardingStage(option.stage);
                pushToast("路线已切换", `接下来会优先推荐「${option.label}」相关场景。`);
                setDismissed(true);
              }}
            >
              <p className="text-sm font-semibold text-foreground">{option.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="px-5 pt-4 text-right">
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              completeOnboarding();
              setDismissed(true);
            }}
          >
            先不选，直接进入首页
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
