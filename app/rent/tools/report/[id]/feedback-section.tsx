"use client";

import { useState } from "react";
import { CheckCircle2, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackSectionProps {
  reportId: string;
}

const FEEDBACK_STORAGE_KEY = "young-study_rent_report_feedback";
const LEGACY_FEEDBACK_STORAGE_KEY = "spacerisk_feedback";

export function FeedbackSection({ reportId }: FeedbackSectionProps) {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const feedback = {
      reportId,
      helpful,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    const existing = JSON.parse(
      localStorage.getItem(FEEDBACK_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_FEEDBACK_STORAGE_KEY) ??
        "[]"
    );
    existing.push(feedback);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="paper-panel rounded-[1.8rem] p-6 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
        <h3 className="mt-3 text-base font-medium text-foreground">反馈已收到</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          这些反馈会帮助我们把新手租房指导讲得更准、更清楚。
        </p>
      </section>
    );
  }

  return (
    <section className="paper-panel rounded-[1.8rem] p-6">
      <div className="flex items-center gap-2">
        <span className="section-kicker">报告反馈</span>
      </div>

      <h3 className="mt-5 text-lg font-medium text-foreground">这份租房判断卡帮到你了吗？</h3>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        如果有判断不准、信息缺失，或者哪里讲得还不够清楚，告诉我们会很有帮助。
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setHelpful(true)}
          className={`rounded-[1.35rem] border px-4 py-4 text-left transition-all ${
            helpful === true
              ? "border-emerald-300 bg-emerald-50"
              : "border-border bg-background/72 hover:border-primary/20 hover:bg-card"
          }`}
        >
          <ThumbsUp
            className={`h-5 w-5 ${
              helpful === true ? "text-emerald-600" : "text-muted-foreground"
            }`}
          />
          <div className="mt-3 text-sm font-medium text-foreground">有帮助</div>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            重点和结构对你的租房判断有参考价值。
          </p>
        </button>

        <button
          type="button"
          onClick={() => setHelpful(false)}
          className={`rounded-[1.35rem] border px-4 py-4 text-left transition-all ${
            helpful === false
              ? "border-red-300 bg-red-50"
              : "border-border bg-background/72 hover:border-primary/20 hover:bg-card"
          }`}
        >
          <ThumbsDown
            className={`h-5 w-5 ${
              helpful === false ? "text-red-600" : "text-muted-foreground"
            }`}
          />
          <div className="mt-3 text-sm font-medium text-foreground">还不够清楚</div>
          <p className="mt-1 text-sm leading-7 text-muted-foreground">
            某些判断和实际情况不一致，或者结论还不够可信。
          </p>
        </button>
      </div>

      {helpful !== null ? (
        <div className="mt-5 space-y-3">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={
              helpful
                ? "如果你愿意，可以告诉我们哪一部分最有帮助。"
                : "例如：实际噪声更大、采光判断偏乐观，或者某个关键问题被漏掉了。"
            }
            rows={4}
            className="w-full rounded-[1.35rem] border border-border bg-background/72 px-4 py-3 text-sm leading-7 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          <Button
            type="button"
            onClick={handleSubmit}
            className="h-11 rounded-full px-5"
            variant={helpful ? "outline" : "default"}
          >
            <Send className="mr-2 h-4 w-4" />
            提交反馈
          </Button>
        </div>
      ) : null}
    </section>
  );
}
