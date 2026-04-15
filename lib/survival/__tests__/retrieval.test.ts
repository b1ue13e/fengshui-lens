import { describe, expect, it } from "vitest";

import { retrieveKnowledgeMatches } from "../retrieval";
import type { SurvivalKnowledgeBase } from "../../types/survival-sandbox";

const base: SurvivalKnowledgeBase = {
  version: "test",
  sources: [
    {
      id: "source-1",
      title: "上海来源",
      publisher: "上海市人民政府",
      url: "https://example.com/shanghai",
      sourceType: "policy",
      city: "shanghai",
      publishedAt: "2026-01-01",
      effectiveAt: null,
      reviewedAt: "2026-04-15",
    },
    {
      id: "source-2",
      title: "北京来源",
      publisher: "北京市人民政府",
      url: "https://example.com/beijing",
      sourceType: "policy",
      city: "beijing",
      publishedAt: "2026-01-01",
      effectiveAt: null,
      reviewedAt: "2026-04-15",
    },
  ],
  documents: [
    {
      id: "doc-1",
      sourceId: "source-1",
      title: "上海应届",
      summary: "",
      cityTags: ["shanghai"],
      personaTags: ["fresh_graduate"],
      topicTags: ["offer"],
      versionTag: "test",
    },
    {
      id: "doc-2",
      sourceId: "source-2",
      title: "北京应届",
      summary: "",
      cityTags: ["beijing"],
      personaTags: ["fresh_graduate"],
      topicTags: ["offer"],
      versionTag: "test",
    },
    {
      id: "doc-3",
      sourceId: "source-1",
      title: "上海社招",
      summary: "",
      cityTags: ["shanghai"],
      personaTags: ["experienced_worker"],
      topicTags: ["offer"],
      versionTag: "test",
    },
  ],
  chunks: [
    {
      id: "chunk-1",
      documentId: "doc-1",
      title: "上海应届签约前",
      content: "上海 应届 offer",
      whyItMatters: "why",
      actions: ["do"],
      requiredMaterials: ["mat"],
      deadlineOrTrigger: "before",
      topicTags: ["offer"],
      stageIds: ["before_offer"],
      cityTags: ["shanghai"],
      personaTags: ["fresh_graduate"],
      keywords: ["offer"],
      confidence: "high",
      verificationRequired: false,
      priority: 90,
    },
    {
      id: "chunk-2",
      documentId: "doc-2",
      title: "北京应届签约前",
      content: "北京 应届 offer",
      whyItMatters: "why",
      actions: ["do"],
      requiredMaterials: ["mat"],
      deadlineOrTrigger: "before",
      topicTags: ["offer"],
      stageIds: ["before_offer"],
      cityTags: ["beijing"],
      personaTags: ["fresh_graduate"],
      keywords: ["offer"],
      confidence: "high",
      verificationRequired: false,
      priority: 99,
    },
    {
      id: "chunk-3",
      documentId: "doc-3",
      title: "上海社招签约前",
      content: "上海 社招 offer",
      whyItMatters: "why",
      actions: ["do"],
      requiredMaterials: ["mat"],
      deadlineOrTrigger: "before",
      topicTags: ["offer"],
      stageIds: ["before_offer"],
      cityTags: ["shanghai"],
      personaTags: ["experienced_worker"],
      keywords: ["offer"],
      confidence: "high",
      verificationRequired: false,
      priority: 110,
    },
  ],
};

describe("retrieveKnowledgeMatches", () => {
  it("filters out non-shanghai and non-fresh-graduate knowledge", async () => {
    const matches = await retrieveKnowledgeMatches({
      knowledgeBase: base,
      input: {
        targetCity: "shanghai",
        originCity: "合肥",
        graduationDate: "2026-06-30",
        offerStatus: "no_offer",
        arrivalWindow: "this_month",
        housingBudget: "3500-4500",
        hukouInterest: "maybe",
        currentHousingStatus: "campus",
      },
      stageId: "before_offer",
    });

    expect(matches).toHaveLength(1);
    expect(matches[0]?.chunk.id).toBe("chunk-1");
    expect(matches[0]?.source.city).toBe("shanghai");
    expect(matches[0]?.chunk.personaTags).toContain("fresh_graduate");
  });
});
