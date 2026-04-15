import { survivalKnowledgeBase } from "../content/survival-sandbox";
import { isRemoteContentEnabled } from "../supabase/env";
import { getServerSupabaseClient } from "../supabase/server";
import type {
  KnowledgeChunk,
  KnowledgeDocument,
  KnowledgeSource,
  SurvivalKnowledgeBase,
} from "../types/survival-sandbox";

function parseVector(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is number => typeof item === "number");
  }

  if (typeof value === "string" && value.startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is number => typeof item === "number")
        : null;
    } catch {
      return null;
    }
  }

  return null;
}

function mapSourceRow(row: Record<string, unknown>): KnowledgeSource {
  return {
    id: String(row.id),
    title: String(row.title),
    publisher: String(row.publisher),
    url: String(row.url),
    sourceType: row.source_type as KnowledgeSource["sourceType"],
    city: String(row.city),
    publishedAt: String(row.published_at),
    effectiveAt: row.effective_at ? String(row.effective_at) : null,
    reviewedAt: String(row.reviewed_at),
    note: row.note ? String(row.note) : undefined,
  };
}

function mapDocumentRow(row: Record<string, unknown>): KnowledgeDocument {
  return {
    id: String(row.id),
    sourceId: String(row.source_id),
    title: String(row.title),
    summary: String(row.summary),
    cityTags: Array.isArray(row.city_tags) ? row.city_tags.map(String) : [],
    personaTags: Array.isArray(row.persona_tags) ? row.persona_tags.map(String) : [],
    topicTags: Array.isArray(row.topic_tags) ? row.topic_tags.map(String) : [],
    versionTag: String(row.version_tag),
  };
}

function mapChunkRow(row: Record<string, unknown>): KnowledgeChunk {
  return {
    id: String(row.id),
    documentId: String(row.document_id),
    title: String(row.title),
    content: String(row.content),
    whyItMatters: String(row.why_it_matters),
    actions: Array.isArray(row.actions) ? row.actions.map(String) : [],
    requiredMaterials: Array.isArray(row.required_materials)
      ? row.required_materials.map(String)
      : [],
    deadlineOrTrigger: String(row.deadline_or_trigger),
    topicTags: Array.isArray(row.topic_tags) ? row.topic_tags.map(String) : [],
    stageIds: Array.isArray(row.stage_ids) ? (row.stage_ids.map(String) as KnowledgeChunk["stageIds"]) : [],
    cityTags: Array.isArray(row.city_tags) ? row.city_tags.map(String) : [],
    personaTags: Array.isArray(row.persona_tags) ? row.persona_tags.map(String) : [],
    keywords: Array.isArray(row.keywords) ? row.keywords.map(String) : [],
    confidence: row.confidence as KnowledgeChunk["confidence"],
    verificationRequired: Boolean(row.verification_required),
    priority: Number(row.priority ?? 0),
    embedding: parseVector(row.embedding),
  };
}

export async function getSurvivalKnowledgeBase(): Promise<SurvivalKnowledgeBase> {
  if (!isRemoteContentEnabled()) {
    return survivalKnowledgeBase;
  }

  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return survivalKnowledgeBase;
  }

  const [sourcesResult, documentsResult, chunksResult] = await Promise.all([
    supabase.from("knowledge_sources").select("*").order("published_at", { ascending: false }),
    supabase.from("knowledge_documents").select("*").order("id"),
    supabase.from("knowledge_chunks").select("*").order("priority", { ascending: false }),
  ]);

  if (sourcesResult.error || documentsResult.error || chunksResult.error) {
    console.error("[survival/knowledge-repository] Falling back to local knowledge.", {
      sources: sourcesResult.error?.message,
      documents: documentsResult.error?.message,
      chunks: chunksResult.error?.message,
    });
    return survivalKnowledgeBase;
  }

  if (
    !sourcesResult.data?.length ||
    !documentsResult.data?.length ||
    !chunksResult.data?.length
  ) {
    return survivalKnowledgeBase;
  }

  const sources = sourcesResult.data.map((row) => mapSourceRow(row as Record<string, unknown>));
  const documents = documentsResult.data.map((row) =>
    mapDocumentRow(row as Record<string, unknown>)
  );
  const chunks = chunksResult.data.map((row) => mapChunkRow(row as Record<string, unknown>));

  const version = documents[0]?.versionTag || survivalKnowledgeBase.version;

  return {
    version,
    sources,
    documents,
    chunks,
  };
}
