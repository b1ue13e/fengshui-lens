"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const steps = [
  { path: "/evaluate", label: "基础信息", number: 1 },
  { path: "/evaluate/space", label: "空间评估", number: 2 },
  { path: "/evaluate/living", label: "居住需求", number: 3 },
];

export function StepIndicator() {
  const pathname = usePathname();
  const currentIndex = steps.findIndex(s => pathname === s.path);

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={step.path} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isCompleted
                    ? "bg-stone-900 text-white"
                    : isCurrent
                    ? "bg-stone-900 text-white ring-2 ring-stone-200"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-[10px] mt-1 hidden sm:block ${
                  isCurrent ? "text-stone-900 font-medium" : "text-stone-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`w-8 sm:w-12 h-px mx-1 sm:mx-2 transition-colors ${
                  isCompleted ? "bg-stone-900" : "bg-stone-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
