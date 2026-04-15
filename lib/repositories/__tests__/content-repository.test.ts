import { beforeEach, describe, expect, it, vi } from "vitest";

const { getServerSupabaseClient, isRemoteContentEnabled, localSeed } = vi.hoisted(() => ({
  getServerSupabaseClient: vi.fn(),
  isRemoteContentEnabled: vi.fn(),
  localSeed: {
    categories: [
      {
        id: "life-admin",
        name: "本地分类",
        slug: "life-admin",
        icon: "house",
        description: "Local category",
        sortOrder: 1,
        accent: "sand",
      },
    ],
    homeFeedSections: [],
    learningPaths: [],
    scenarios: [
      {
        id: "local-scenario-1",
        title: "本地场景",
        slug: "local-scenario",
        categorySlug: "life-admin",
        categoryName: "本地分类",
        summary: "Local seed scenario",
        difficulty: "easy",
        estimatedMinutes: 8,
        emergencyLevel: 0,
        isFeatured: true,
        starterPriority: 10,
        popularityScore: 5,
        coverStyle: "paper",
        targetStages: ["graduate"],
        keywords: ["local"],
        aliases: [],
        tags: ["seed"],
        oneLiner: "本地一句话",
        targetUsers: [],
        whatYouWillLearn: [],
        preparationItems: [],
        steps: [],
        pitfallItems: [],
        faqs: [],
        scripts: [],
        checklist: {
          id: "local-checklist",
          title: "Checklist",
          items: [],
        },
        quiz: [],
        sections: [],
        relatedScenarioSlugs: [],
      },
    ],
    simulatorScenarios: [],
    toolkitResources: [],
  },
}));

vi.mock("@/lib/content/seed", () => localSeed);

vi.mock("@/lib/supabase/env", () => ({
  isRemoteContentEnabled,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseClient,
}));

import { contentRepository } from "../content-repository";

describe("contentRepository remote content", () => {
  beforeEach(() => {
    getServerSupabaseClient.mockReset();
    isRemoteContentEnabled.mockReset();
  });

  it("stays on the local seed content when remote content is disabled", async () => {
    isRemoteContentEnabled.mockReturnValue(false);

    const cards = await contentRepository.getScenarioCards();

    expect(getServerSupabaseClient).not.toHaveBeenCalled();
    expect(cards).toHaveLength(localSeed.scenarios.length);
    expect(cards[0]?.slug).toBe(localSeed.scenarios[0]?.slug);
  });

  it("falls back to local seed content when Supabase remote content fails", async () => {
    const order = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    isRemoteContentEnabled.mockReturnValue(true);
    getServerSupabaseClient.mockResolvedValue({ from });

    const cards = await contentRepository.getScenarioCards();

    expect(getServerSupabaseClient).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith("scenarios");
    expect(cards).toHaveLength(localSeed.scenarios.length);
    expect(cards[0]?.slug).toBe(localSeed.scenarios[0]?.slug);
  });

  it("uses Supabase scenario cards when remote content is enabled and available", async () => {
    const remoteRows = [
      {
        id: "remote-scenario-1",
        title: "云端办事第一步",
        slug: "remote-first-step",
        summary: "Remote-only scenario",
        difficulty: "easy",
        estimated_minutes: 12,
        emergency_level: 1,
        is_featured: true,
        starter_priority: 99,
        popularity_score: 88,
        cover_style: "sunrise",
        target_stage: ["graduate"],
        keywords: ["remote"],
        aliases: null,
        tags: ["cloud"],
        categories: {
          name: "云端分类",
          slug: "remote-category",
        },
      },
    ];

    const order = vi.fn().mockResolvedValue({
      data: remoteRows,
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    isRemoteContentEnabled.mockReturnValue(true);
    getServerSupabaseClient.mockResolvedValue({ from });

    const cards = await contentRepository.getScenarioCards();

    expect(cards).toEqual([
      {
        id: "remote-scenario-1",
        title: "云端办事第一步",
        slug: "remote-first-step",
        categorySlug: "remote-category",
        categoryName: "云端分类",
        summary: "Remote-only scenario",
        difficulty: "easy",
        estimatedMinutes: 12,
        emergencyLevel: 1,
        isFeatured: true,
        starterPriority: 99,
        popularityScore: 88,
        coverStyle: "sunrise",
        targetStages: ["graduate"],
        keywords: ["remote"],
        aliases: [],
        tags: ["cloud"],
      },
    ]);
  });
});
