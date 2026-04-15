import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow ? <div className="sticker-label">{eyebrow}</div> : null}
      <h2 className="text-balance text-[1.55rem] font-semibold leading-tight text-foreground md:text-[1.9rem]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
