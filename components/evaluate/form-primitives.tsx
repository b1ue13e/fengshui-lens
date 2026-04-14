"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  chips?: string[];
};

type FormSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

type ChoiceCardProps = {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  eyebrow?: string;
  align?: "start" | "center";
  className?: string;
};

type ToggleCardProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description?: string;
  name?: string;
  type?: "checkbox" | "radio";
  className?: string;
};

type NotePanelProps = {
  title: string;
  children: ReactNode;
  tone?: "default" | "warning";
};

export function PageIntro({
  step,
  title,
  description,
  icon: Icon,
  chips = [],
}: PageIntroProps) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium tracking-[0.18em] text-secondary-foreground">
          <Icon className="size-3.5" />
          {step}
        </div>
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-border bg-background/75 px-3 py-1.5 text-xs text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-3xl leading-tight text-balance text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </header>
  );
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("space-y-4 rounded-[1.6rem] bg-card/70 p-5 sm:p-6", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {Icon ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon className="size-4" />
            </span>
          ) : null}
          <span>{title}</span>
        </div>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  eyebrow,
  align = "start",
  className,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-h-24 w-full flex-col justify-between rounded-[1.35rem] border px-4 py-4 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        align === "center" && "items-center text-center",
        selected
          ? "border-primary/25 bg-primary/8 text-foreground shadow-[0_12px_30px_rgba(45,67,55,0.1)]"
          : "border-border bg-background/78 text-foreground hover:border-primary/20 hover:bg-card",
        className
      )}
    >
      {selected ? (
        <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" />
        </span>
      ) : null}
      {eyebrow ? (
        <span className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </span>
      ) : null}
      <div className="space-y-1.5">
        <div className="text-sm font-medium sm:text-[0.95rem]">{title}</div>
        {description ? (
          <p
            className={cn(
              "text-xs leading-6 sm:text-sm",
              selected ? "text-foreground/75" : "text-muted-foreground"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </button>
  );
}

export function ToggleCard({
  checked,
  onChange,
  title,
  description,
  name,
  type = "checkbox",
  className,
}: ToggleCardProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-[1.35rem] border px-4 py-4 transition-all duration-200",
        checked
          ? "border-primary/25 bg-primary/8 shadow-[0_10px_24px_rgba(45,67,55,0.08)]"
          : "border-border bg-background/78 hover:border-primary/18 hover:bg-card",
        className
      )}
    >
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-transparent transition-colors",
          type === "radio" ? "rounded-full" : "rounded-md",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background"
        )}
      >
        <Check className="size-3.5" />
      </span>
      <span className="flex-1 space-y-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        {description ? (
          <span className="block text-sm leading-6 text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function NotePanel({ title, children, tone = "default" }: NotePanelProps) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border px-4 py-4 text-sm leading-7",
        tone === "warning"
          ? "border-accent bg-accent/50 text-accent-foreground"
          : "border-border bg-background/78 text-muted-foreground"
      )}
    >
      <p className="mb-1 font-medium text-foreground">{title}</p>
      <div>{children}</div>
    </div>
  );
}
