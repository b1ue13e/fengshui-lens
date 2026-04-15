import {
  categories,
  homeFeedSections,
  learningPaths,
  scenarios,
  simulatorScenarios,
  toolkitResources,
} from "@/lib/content/seed";
import { isRemoteContentEnabled } from "@/lib/supabase/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Category,
  HomeFeedSection,
  LearningPath,
  ScenarioCard,
  ScenarioDetail,
  SimulatorScenario,
  ToolkitResource,
} from "@/lib/types/young-study";

function asScenarioCard(scenario: ScenarioDetail): ScenarioCard {
  return {
    id: scenario.id,
    title: scenario.title,
    slug: scenario.slug,
    categorySlug: scenario.categorySlug,
    categoryName: scenario.categoryName,
    summary: scenario.summary,
    difficulty: scenario.difficulty,
    estimatedMinutes: scenario.estimatedMinutes,
    emergencyLevel: scenario.emergencyLevel,
    isFeatured: scenario.isFeatured,
    starterPriority: scenario.starterPriority,
    popularityScore: scenario.popularityScore,
    coverStyle: scenario.coverStyle,
    targetStages: scenario.targetStages,
    keywords: scenario.keywords,
    aliases: scenario.aliases,
    tags: scenario.tags,
  };
}

const localScenarioCards = scenarios.map(asScenarioCard);
const localScenarioBySlug = new Map(scenarios.map((scenario) => [scenario.slug, scenario]));
const localScenarioCardBySlug = new Map(
  localScenarioCards.map((scenario) => [scenario.slug, scenario])
);
const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

async function getRemoteScenarioCards(): Promise<ScenarioCard[] | null> {
  if (!isRemoteContentEnabled()) {
    return null;
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("scenarios")
    .select(
      "id, title, slug, summary, difficulty, estimated_minutes, emergency_level, is_featured, starter_priority, popularity_score, cover_style, target_stage, keywords, aliases, tags, categories(name, slug)"
    )
    .order("starter_priority", { ascending: false });

  if (error || !data) {
    return null;
  }

  type RemoteScenarioRow = {
    id: string;
    title: string;
    slug: string;
    summary: string;
    difficulty: ScenarioCard["difficulty"];
    estimated_minutes: number;
    emergency_level: number;
    is_featured: boolean;
    starter_priority: number;
    popularity_score: number;
    cover_style: string;
    target_stage: ScenarioCard["targetStages"];
    keywords: string[] | null;
    aliases: string[] | null;
    tags: string[] | null;
    categories?: { name?: string | null; slug?: string | null } | null;
  };

  return (data as RemoteScenarioRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    categorySlug: row.categories?.slug ?? "life-admin",
    categoryName: row.categories?.name ?? "Uncategorized",
    summary: row.summary,
    difficulty: row.difficulty,
    estimatedMinutes: row.estimated_minutes,
    emergencyLevel: row.emergency_level,
    isFeatured: row.is_featured,
    starterPriority: row.starter_priority,
    popularityScore: row.popularity_score,
    coverStyle: row.cover_style,
    targetStages: row.target_stage ?? [],
    keywords: row.keywords ?? [],
    aliases: row.aliases ?? [],
    tags: row.tags ?? [],
  }));
}

export const contentRepository = {
  async getCategories(): Promise<Category[]> {
    return categories;
  },

  async getScenarioCards(): Promise<ScenarioCard[]> {
    const remoteCards = await getRemoteScenarioCards();

    if (remoteCards?.length) {
      return remoteCards;
    }

    return localScenarioCards;
  },

  async getFeaturedScenarios(): Promise<ScenarioCard[]> {
    const cards = await this.getScenarioCards();
    return cards
      .filter((card) => card.isFeatured)
      .sort((left, right) => right.popularityScore - left.popularityScore);
  },

  async getScenarioBySlug(slug: string): Promise<ScenarioDetail | null> {
    return localScenarioBySlug.get(slug) ?? null;
  },

  async getScenariosByCategory(categorySlug: string): Promise<ScenarioCard[]> {
    const cards = await this.getScenarioCards();
    return cards.filter((card) => card.categorySlug === categorySlug);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return categoryBySlug.get(slug) ?? null;
  },

  async getLearningPaths(): Promise<LearningPath[]> {
    return learningPaths;
  },

  async getLearningPathBySlug(slug: string): Promise<LearningPath | null> {
    return learningPaths.find((path) => path.slug === slug) ?? null;
  },

  async getToolkitResources(): Promise<ToolkitResource[]> {
    return toolkitResources;
  },

  async getToolkitResourceBySlug(slug: string): Promise<ToolkitResource | null> {
    return toolkitResources.find((toolkit) => toolkit.slug === slug) ?? null;
  },

  async getSimulatorScenarios(): Promise<SimulatorScenario[]> {
    return simulatorScenarios;
  },

  async getSimulatorScenarioBySlug(slug: string): Promise<SimulatorScenario | null> {
    return simulatorScenarios.find((item) => item.slug === slug) ?? null;
  },

  async getHomeFeedSections(): Promise<HomeFeedSection[]> {
    return homeFeedSections;
  },
};

export function getScenarioCardBySlug(slug: string) {
  return localScenarioCardBySlug.get(slug) ?? null;
}
