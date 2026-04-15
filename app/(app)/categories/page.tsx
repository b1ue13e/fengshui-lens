import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { contentRepository } from "@/lib/repositories/content-repository";
import { categoryIcons } from "@/components/shared/icon-map";
import { SectionHeading } from "@/components/shared/section-heading";

export default async function CategoriesPage() {
  const [categories, scenarioCards] = await Promise.all([
    contentRepository.getCategories(),
    contentRepository.getScenarioCards(),
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="分类总览"
        title="学校不教，但你很快会用上的场景都在这里"
        description="按生活办事、出行、求职、租房、应急这些真实系统来分，不按空泛知识点来分。"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const count = scenarioCards.filter((item) => item.categorySlug === category.slug).length;
          const Icon = categoryIcons[category.icon];

          return (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="soft-panel rounded-[1.8rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-12 items-center justify-center rounded-[1.2rem] bg-background/72">
                  <Icon className="size-5 text-primary" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">{category.name}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{category.description}</p>
              <p className="mt-4 text-sm text-foreground/75">{count} 个场景</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
