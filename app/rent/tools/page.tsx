import { FileSearch, GitCompareArrows, House, ScanSearch } from "lucide-react";

import { ToolEntryCard } from "@/components/rent-tools/tool-entry-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { rentToolLinks } from "@/lib/rent-tools/tool-links";

const iconMap = {
  analyze: ScanSearch,
  evaluate: House,
  compare: GitCompareArrows,
  report: FileSearch,
} as const;

export default function RentToolsPage() {
  return (
    <div className="space-y-8">
      <section className="hero-panel cover-sand rounded-[2rem] p-5 md:p-7">
        <p className="sticker-label">租房专区</p>
        <h1 className="mt-4 max-w-2xl text-[2rem] font-semibold text-foreground md:text-[2.6rem]">
          把租房这件高风险小事，拆成能操作的工具和判断步骤。
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/78 md:text-base">
          这里不是另一个产品，而是青年大学习里“租房住房”场景下的一组高级工具。
          你可以先速读房源链接，也可以手动评估、对比两个房源，或者直接看完整判断卡示例。
        </p>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="租房工具"
          title="先选你现在最需要的那一个"
          description="先用工具排除明显坑位，再去看合同、价格和入住细节，会比一上来被房源文案带着走更稳。"
        />
        <div className="grid gap-4 md:grid-cols-2">
          {rentToolLinks.map((tool) => {
            const Icon = iconMap[tool.slug as keyof typeof iconMap];
            return (
              <ToolEntryCard
                key={tool.slug}
                title={tool.title}
                description={tool.description}
                href={tool.href}
                eyebrow={tool.eyebrow}
                icon={Icon}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
