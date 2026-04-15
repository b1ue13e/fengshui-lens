"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ScenarioCard as ScenarioCardType } from "@/lib/types/young-study";
import { useAppStore } from "@/lib/store/app-store";
import { DIFFICULTY_LABELS } from "@/lib/content/seed";
import { cn } from "@/lib/utils";

export function ScenarioCard({
  scenario,
  compact = false,
}: {
  scenario: ScenarioCardType;
  compact?: boolean;
}) {
  const completed = useAppStore((state) => state.completed.includes(scenario.slug));
  const favorited = useAppStore((state) => state.favorites.includes(scenario.slug));

  return (
    <Link
      href={`/scenario/${scenario.slug}`}
      className={cn(
        "group soft-panel flex flex-col gap-4 rounded-[1.8rem] p-4 transition-transform hover:-translate-y-0.5",
        compact ? "min-h-[188px]" : "min-h-[220px]"
      )}
    >
      <div className={cn("rounded-[1.35rem] p-4 text-foreground", `cover-${scenario.coverStyle}`)}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge variant="outline" className="border-white/60 bg-white/55 text-[0.68rem] text-foreground">
              {scenario.categoryName}
            </Badge>
            <h3 className="text-lg font-semibold leading-tight">{scenario.title}</h3>
          </div>
          <ArrowUpRight className="size-4 text-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">{scenario.summary}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
          <Clock3 className="size-3.5" />
          {scenario.estimatedMinutes} 分钟
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
          {DIFFICULTY_LABELS[scenario.difficulty]}
        </span>
        {scenario.emergencyLevel > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
            <ShieldAlert className="size-3.5" />
            紧急优先
          </span>
        ) : null}
        {completed ? <span className="rounded-full bg-primary/12 px-2.5 py-1 text-primary">已完成</span> : null}
        {favorited ? <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">已收藏</span> : null}
      </div>
    </Link>
  );
}
