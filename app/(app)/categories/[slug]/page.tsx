import { notFound } from "next/navigation";

import { ScenarioCard } from "@/components/scenario/scenario-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { contentRepository } from "@/lib/repositories/content-repository";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, scenarios] = await Promise.all([
    contentRepository.getCategoryBySlug(slug),
    contentRepository.getScenariosByCategory(slug),
  ]);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className={`hero-panel cover-${category.accent} rounded-[2rem] p-5 md:p-7`}>
        <p className="sticker-label">分类页</p>
        <h1 className="mt-4 text-[2rem] font-semibold text-foreground">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/78">{category.description}</p>
        <p className="mt-4 rounded-full bg-white/68 px-4 py-2 text-sm text-foreground/82">
          这里有 {scenarios.length} 个可直接浏览的场景。
        </p>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title={`先从这些 ${category.name} 场景开始`}
          description="每个场景都按“先知道、再准备、再行动、再避坑”的顺序拆开。"
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.slug} scenario={scenario} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
