"use client";

import { useMemo, useState } from "react";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import type { SimulatorScenario } from "@/lib/types/young-study";

function toneClasses(tone: "good" | "okay" | "risky") {
  if (tone === "good") {
    return "bg-primary/10 text-foreground";
  }

  if (tone === "risky") {
    return "bg-destructive/8 text-foreground";
  }

  return "bg-secondary text-secondary-foreground";
}

export function SimulatorPlayer({ scenarios }: { scenarios: SimulatorScenario[] }) {
  const [activeSlug, setActiveSlug] = useState(scenarios[0]?.slug ?? "");
  const [goalId, setGoalId] = useState<string | undefined>(scenarios[0]?.goals[0]?.id);
  const [nodeId, setNodeId] = useState<string>("start");
  const [feedback, setFeedback] = useState<string>("");
  const [generatedLines, setGeneratedLines] = useState<string[]>([]);

  const activeScenario = useMemo(
    () => scenarios.find((item) => item.slug === activeSlug) ?? scenarios[0],
    [activeSlug, scenarios]
  );
  const activeGoal = activeScenario?.goals.find((item) => item.id === goalId) ?? activeScenario?.goals[0];
  const activeNode = activeScenario?.nodes.find((node) => node.id === nodeId) ?? activeScenario?.nodes[0];

  function resetConversation(nextSlug?: string, nextGoalId?: string) {
    setActiveSlug(nextSlug ?? activeScenario.slug);
    setGoalId(nextGoalId ?? activeScenario.goals[0]?.id);
    setNodeId("start");
    setFeedback("");
    setGeneratedLines(nextGoalId || activeGoal ? [nextGoalId ? (activeScenario.goals.find((item) => item.id === nextGoalId)?.openingLine ?? "") : activeGoal?.openingLine ?? ""] : []);
  }

  if (!activeScenario || !activeGoal || !activeNode) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="对话模拟器"
        title="先练一遍，再去现实里开口"
        description="MVP 先用规则驱动场景，把最常见的开场、追问和收口练熟。"
      />

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.slug}
              type="button"
              className={`soft-panel w-full rounded-[1.6rem] p-4 text-left ${
                activeSlug === scenario.slug ? "ring-2 ring-primary/40" : ""
              }`}
              onClick={() => {
                setActiveSlug(scenario.slug);
                setGoalId(scenario.goals[0]?.id);
                setNodeId("start");
                setFeedback("");
                setGeneratedLines([scenario.goals[0]?.openingLine ?? ""]);
              }}
            >
              <h3 className="text-base font-semibold text-foreground">{scenario.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{scenario.summary}</p>
            </button>
          ))}
        </aside>

        <section className="soft-panel rounded-[2rem] p-5">
          <div className="flex flex-wrap gap-2">
            {activeScenario.goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                className={`rounded-full px-3 py-1 text-sm ${
                  goal.id === activeGoal.id ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
                }`}
                onClick={() => resetConversation(activeScenario.slug, goal.id)}
              >
                {goal.label}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">建议开场</p>
            <p className="mt-2 text-sm leading-7 text-foreground">{activeGoal.openingLine}</p>
          </div>

          <div className="mt-5 rounded-[1.6rem] bg-card p-4">
            <p className="text-sm font-semibold text-foreground">{activeNode.title}</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{activeNode.message}</p>
            <div className="mt-4 grid gap-3">
              {activeNode.options.length ? (
                activeNode.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`rounded-[1.2rem] px-4 py-3 text-left text-sm ${toneClasses(option.tone)}`}
                    onClick={() => {
                      setFeedback(option.feedback);
                      setGeneratedLines((current) =>
                        option.appendToScript ? [...current, option.appendToScript] : current
                      );
                      if (option.nextNodeId) {
                        setNodeId(option.nextNodeId);
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="rounded-[1.2rem] bg-primary/10 px-4 py-3 text-sm text-foreground">
                  {activeGoal.successLine}
                </div>
              )}
            </div>
          </div>

          {feedback ? (
            <div className="mt-4 rounded-[1.4rem] bg-background/72 px-4 py-3 text-sm leading-7 text-foreground/82">
              {feedback}
            </div>
          ) : null}

          <div className="mt-5 rounded-[1.6rem] bg-background/72 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">生成中的推荐话术</p>
              <Badge variant="secondary">逐步拼好</Badge>
            </div>
            <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
              {generatedLines.map((line, index) => (
                <p key={`${line}-${index}`} className="rounded-[1rem] bg-card px-3 py-2 text-foreground/82">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
