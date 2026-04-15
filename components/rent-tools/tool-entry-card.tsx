import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

export function ToolEntryCard({
  title,
  description,
  href,
  eyebrow,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  eyebrow: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="soft-panel rounded-[1.6rem] p-4 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-background/72">
          <Icon className="size-5 text-primary" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </Link>
  );
}
