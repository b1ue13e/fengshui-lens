import { describe, expect, it } from "vitest";

import { buildSurvivalKnowledgeSeedPayload } from "../knowledge-export";

describe("buildSurvivalKnowledgeSeedPayload", () => {
  it("exports sources, documents, and chunks with required audit fields", async () => {
    const payload = await buildSurvivalKnowledgeSeedPayload({ includeEmbeddings: false });

    expect(payload.counts.knowledge_sources).toBeGreaterThan(0);
    expect(payload.counts.knowledge_documents).toBeGreaterThan(0);
    expect(payload.counts.knowledge_chunks).toBeGreaterThan(0);

    for (const source of payload.tables.knowledge_sources) {
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.published_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.reviewed_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.city.length).toBeGreaterThan(0);
    }

    for (const document of payload.tables.knowledge_documents) {
      expect(document.city_tags.length).toBeGreaterThan(0);
      expect(document.persona_tags.length).toBeGreaterThan(0);
      expect(document.topic_tags.length).toBeGreaterThan(0);
      expect(document.version_tag.length).toBeGreaterThan(0);
    }

    for (const chunk of payload.tables.knowledge_chunks) {
      expect(chunk.stage_ids.length).toBeGreaterThan(0);
      expect(chunk.topic_tags.length).toBeGreaterThan(0);
      expect(chunk.city_tags.length).toBeGreaterThan(0);
      expect(chunk.persona_tags.length).toBeGreaterThan(0);
      expect(chunk.title.length).toBeGreaterThan(0);
      expect(chunk.why_it_matters.length).toBeGreaterThan(0);
    }
  });
});
