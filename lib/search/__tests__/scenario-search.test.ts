import { describe, expect, it } from "vitest";

import { scenarios } from "../../content/seed";
import { searchScenarioCards } from "../scenario-search";

const cards = scenarios.map((scenario) => ({
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
}));

describe("青年大学习搜索", () => {
  it("优先按标题和关键词返回相关场景", () => {
    const results = searchScenarioCards(cards, "租房");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("how-to-rent-house");
  });

  it("支持按分类筛选", () => {
    const results = searchScenarioCards(cards, "银行卡", { categorySlug: "finance" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.categorySlug === "finance")).toBe(true);
    expect(results[0].slug).toBe("how-to-get-bank-card");
  });

  it("空查询时按新手优先级和热度排序", () => {
    const results = searchScenarioCards(cards, "");
    expect(results.length).toBe(cards.length);

    for (let index = 0; index < results.length - 1; index += 1) {
      const current = results[index];
      const next = results[index + 1];
      const ordered =
        current.starterPriority > next.starterPriority ||
        (current.starterPriority === next.starterPriority &&
          current.popularityScore >= next.popularityScore);
      expect(ordered).toBe(true);
    }
  });
});
