import { survivalKnowledgeBase } from "../content/survival-sandbox";
import { embedText, hasEmbeddingConfig } from "./embeddings";
import type { SurvivalKnowledgeSeedPayload } from "../types/survival-sandbox";

export async function buildSurvivalKnowledgeSeedPayload({
  includeEmbeddings = false,
}: {
  includeEmbeddings?: boolean;
} = {}): Promise<SurvivalKnowledgeSeedPayload> {
  const shouldEmbed = includeEmbeddings && hasEmbeddingConfig();
  const embeddings = shouldEmbed
    ? await Promise.all(
        survivalKnowledgeBase.chunks.map((chunk) =>
          embedText(
            [
              chunk.title,
              chunk.content,
              chunk.whyItMatters,
              chunk.actions.join(" "),
              chunk.requiredMaterials.join(" "),
            ].join("\n")
          )
        )
      )
    : survivalKnowledgeBase.chunks.map(() => null);

  return {
    exportedAt: new Date().toISOString(),
    counts: {
      knowledge_sources: survivalKnowledgeBase.sources.length,
      knowledge_documents: survivalKnowledgeBase.documents.length,
      knowledge_chunks: survivalKnowledgeBase.chunks.length,
    },
    tables: {
      knowledge_sources: survivalKnowledgeBase.sources.map((source) => ({
        id: source.id,
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        source_type: source.sourceType,
        city: source.city,
        published_at: source.publishedAt,
        effective_at: source.effectiveAt ?? null,
        reviewed_at: source.reviewedAt,
        note: source.note ?? null,
      })),
      knowledge_documents: survivalKnowledgeBase.documents.map((document) => ({
        id: document.id,
        source_id: document.sourceId,
        title: document.title,
        summary: document.summary,
        city_tags: document.cityTags,
        persona_tags: document.personaTags,
        topic_tags: document.topicTags,
        version_tag: document.versionTag,
      })),
      knowledge_chunks: survivalKnowledgeBase.chunks.map((chunk, index) => ({
        id: chunk.id,
        document_id: chunk.documentId,
        title: chunk.title,
        content: chunk.content,
        why_it_matters: chunk.whyItMatters,
        actions: chunk.actions,
        required_materials: chunk.requiredMaterials,
        deadline_or_trigger: chunk.deadlineOrTrigger,
        topic_tags: chunk.topicTags,
        stage_ids: chunk.stageIds,
        city_tags: chunk.cityTags,
        persona_tags: chunk.personaTags,
        keywords: chunk.keywords,
        confidence: chunk.confidence,
        verification_required: chunk.verificationRequired,
        priority: chunk.priority,
        embedding: embeddings[index],
      })),
    },
  };
}
