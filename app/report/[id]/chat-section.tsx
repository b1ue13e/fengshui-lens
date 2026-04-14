"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MessageSquare, Paintbrush, Volume2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EngineResult } from "@/types";
import { ChatScript, generateChatScripts } from "@/lib/llm/chat-scripts";

interface ChatSectionProps {
  report: EngineResult;
}

const scenarioMeta = {
  negotiate: {
    label: "谈价格",
    description: "把报告里的问题转成更有依据的议价表达。",
    icon: Volume2,
  },
  repair: {
    label: "谈维修",
    description: "明确哪些问题应由房东先解决，哪些可以换成价格让步。",
    icon: Wrench,
  },
  renovation: {
    label: "谈改造",
    description: "入住后想做低成本调整时，提前把边界说清楚。",
    icon: Paintbrush,
  },
} as const;

const toneMeta = {
  gentle: { label: "温和协商", color: "bg-sky-100 text-sky-800 border-sky-200" },
  firm: { label: "现实压价", color: "bg-amber-100 text-amber-800 border-amber-200" },
  direct: { label: "直接指出", color: "bg-stone-200 text-stone-800 border-stone-300" },
} as const;

function ScriptCard({ script }: { script: ChatScript }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="rounded-[1.35rem] border border-border bg-background/72 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge className={toneMeta[script.tone].color}>{toneMeta[script.tone].label}</Badge>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 rounded-full px-3 text-muted-foreground"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4 text-emerald-600" />
              已复制
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4" />
              复制话术
            </>
          )}
        </Button>
      </div>
      <p className="mt-3 text-sm leading-7 text-foreground whitespace-pre-wrap">
        {script.content}
      </p>
    </article>
  );
}

export function ChatScriptSection({ report }: ChatSectionProps) {
  const [activeScenario, setActiveScenario] = useState<
    "negotiate" | "repair" | "renovation"
  >("negotiate");

  const scripts = useMemo(() => generateChatScripts(report), [report]);
  const scenarioScripts = scripts.filter((item) => item.scenario === activeScenario);

  return (
    <section className="paper-panel rounded-[1.8rem] p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-primary" />
        <span className="section-kicker">沟通话术</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(Object.keys(scenarioMeta) as Array<keyof typeof scenarioMeta>).map((key) => {
          const meta = scenarioMeta[key];
          const Icon = meta.icon;
          const active = activeScenario === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveScenario(key)}
              className={`rounded-[1.35rem] border px-4 py-4 text-left transition-all ${
                active
                  ? "border-primary/25 bg-primary/8 shadow-[0_10px_24px_rgba(45,67,55,0.08)]"
                  : "border-border bg-background/72 hover:border-primary/20 hover:bg-card"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon className="size-4" />
                {meta.label}
              </div>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        下面提供三种语气版本，你可以直接复制后按实际情况调整金额、维修项或时间要求。
      </p>

      <div className="mt-4 space-y-3">
        {scenarioScripts.map((script) => (
          <ScriptCard key={`${script.scenario}-${script.tone}`} script={script} />
        ))}
      </div>
    </section>
  );
}
