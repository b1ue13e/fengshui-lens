import { notFound } from "next/navigation";

import { ScenarioDetailScreen } from "@/components/scenario/scenario-detail-screen";
import { contentRepository, getScenarioCardBySlug } from "@/lib/repositories/content-repository";
import type { ScenarioCard } from "@/lib/types/young-study";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = await contentRepository.getScenarioBySlug(slug);

  if (!scenario) {
    notFound();
  }

  const related = scenario.relatedScenarioSlugs
    .map((item) => getScenarioCardBySlug(item))
    .filter((item): item is ScenarioCard => Boolean(item))
    .slice(0, 3);

  return <ScenarioDetailScreen scenario={scenario} related={related} />;
}
