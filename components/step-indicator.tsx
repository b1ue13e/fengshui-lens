"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const steps = [
  { path: "/evaluate", label: "基础信息", number: 1 },
  { path: "/evaluate/space", label: "空间情况", number: 2 },
  { path: "/evaluate/living", label: "居住需求", number: 3 },
];

export function StepIndicator() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex((step) => pathname === step.path);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <Fragment key={step.path}>
            <div
              className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs transition-colors sm:px-3 ${
                isCompleted
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : isCurrent
                    ? "border-border bg-card text-foreground shadow-[0_8px_24px_rgba(95,83,57,0.08)]"
                    : "border-border/90 bg-background/70 text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium ${
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-3.5" /> : step.number}
              </span>
              <span className="hidden whitespace-nowrap sm:block">{step.label}</span>
            </div>

            {index < steps.length - 1 && (
              <div className="h-px w-3 bg-border sm:w-5" />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
