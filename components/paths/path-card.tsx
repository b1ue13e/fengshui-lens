"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { LearningPath } from "@/lib/types/young-study";
import { useAppStore } from "@/lib/store/app-store";

export function PathCard({ path }: { path: LearningPath }) {
  const completed = useAppStore((state) => state.completed);
  const completedCount = path.scenarioSlugs.filter((slug) => completed.includes(slug)).length;
  const progressValue = Math.round((completedCount / path.scenarioSlugs.length) * 100);

  return (
    <Link href="/paths" className={`soft-panel cover-${path.cover} group rounded-[1.8rem] p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="sticker-label bg-white/60 text-foreground/80">学习路线</p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{path.title}</h3>
        </div>
        <ArrowRight className="size-4 text-foreground/60 transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-3 text-sm leading-7 text-foreground/72">{path.description}</p>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm text-foreground/78">
          <span>{completedCount}/{path.scenarioSlugs.length} 已完成</span>
          <span>{progressValue}%</span>
        </div>
        <Progress value={progressValue} />
      </div>
    </Link>
  );
}
