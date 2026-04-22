import type { Metadata } from "next";
import Link from "next/link";
import { Home, Clock3, Signal, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

import { buildCategoryMetadata } from "@/lib/metadata/page-metadata";
import { contentRepository } from "@/lib/repositories/content-repository";
import { DIFFICULTY_LABELS } from "@/lib/content/seed";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await contentRepository.getCategoryBySlug(slug);

  if (!category) {
    return buildCategoryMetadata(
      "分类训练",
      "这是青年大学习里的场景判断训练集合，不是单纯内容分类。",
      `/categories/${slug}`
    );
  }

  return buildCategoryMetadata(
    category.name,
    `这是青年大学习里的${category.name}场景判断训练集合，不是单纯内容分类，而是继续补判断、补准备和补行动。`,
    `/categories/${slug}`
  );
}

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
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/" className="flex items-center gap-1 hover:text-neutral-900">
          <Home className="h-4 w-4" /> 首页
        </Link>
        <span>/</span>
        <Link href="/resources" className="hover:text-neutral-900">学习资源</Link>
        <span>/</span>
        <span>{category.name}</span>
      </div>

      <div>
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">{category.name}</h1>
        <p className="text-neutral-500">{category.description}</p>
      </div>

      <div className="space-y-3">
        {scenarios.length === 0 ? <p className="text-neutral-500">该分类下暂无场景</p> : null}
        {scenarios.map((scenario) => (
          <Link key={scenario.slug} href={`/scenario/${scenario.slug}`}>
            <div className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-neutral-900">{scenario.title}</h3>
                  <p className="mb-2 text-sm text-neutral-500">{scenario.summary}</p>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {scenario.estimatedMinutes} 分钟</span>
                    <span className="flex items-center gap-1"><Signal className="h-3 w-3" /> {DIFFICULTY_LABELS[scenario.difficulty]}</span>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-neutral-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}