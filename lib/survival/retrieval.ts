import {
  arrivalWindowLabels,
  hukouInterestLabels,
  housingStatusLabels,
  offerStatusLabels,
  routeStageMeta,
} from "./config";
import { cosineSimilarity, embedText, hasEmbeddingConfig } from "./embeddings";
import type {
  KnowledgeChunk,
  KnowledgeChunkMatch,
  RouteCitation,
  RouteStageKey,
  RouteWizardInput,
  SurvivalKnowledgeBase,
} from "../types/survival-sandbox";

function includesTag(tags: string[], target: string) {
  return tags.includes(target) || tags.includes("all");
}

function toCitation(match: Omit<KnowledgeChunkMatch, "score" | "reasons">): RouteCitation {
  return {
    sourceId: match.source.id,
    documentId: match.document.id,
    sourceTitle: match.source.title,
    documentTitle: match.document.title,
    publisher: match.source.publisher,
    url: match.source.url,
    city: match.source.city,
    publishedAt: match.source.publishedAt,
    effectiveAt: match.source.effectiveAt,
    reviewedAt: match.source.reviewedAt,
    note: match.source.note,
  };
}

function keywordScore(chunk: KnowledgeChunk, queryText: string) {
  const haystack = `${chunk.title} ${chunk.content} ${chunk.keywords.join(" ")} ${chunk.topicTags.join(" ")}`.toLowerCase();
  const terms = queryText
    .toLowerCase()
    .split(/[^a-z0-9\u4e00-\u9fa5]+/u)
    .filter(Boolean);

  return terms.reduce((total, term) => (haystack.includes(term) ? total + 0.9 : total), 0);
}

function getQueryText(stageId: RouteStageKey, input: RouteWizardInput) {
  return [
    routeStageMeta[stageId].label,
    routeStageMeta[stageId].description,
    input.targetCity,
    input.originCity,
    offerStatusLabels[input.offerStatus],
    arrivalWindowLabels[input.arrivalWindow],
    hukouInterestLabels[input.hukouInterest],
    housingStatusLabels[input.currentHousingStatus],
    input.housingBudget,
  ].join(" ");
}

function scoreForInput(chunk: KnowledgeChunk, stageId: RouteStageKey, input: RouteWizardInput) {
  let score = chunk.priority;
  const reasons: string[] = [];

  if (chunk.stageIds.includes(stageId)) {
    score += 60;
    reasons.push("stage-match");
  }

  if (input.hukouInterest === "strong_yes" && chunk.topicTags.includes("hukou")) {
    score += 20;
    reasons.push("hukou-strong");
  }

  if (input.hukouInterest === "not_now" && chunk.topicTags.includes("hukou")) {
    score -= 12;
    reasons.push("hukou-softened");
  }

  if (
    ["signed_offer", "already_onboarded"].includes(input.offerStatus) &&
    ["onboarding", "social_insurance"].some((topic) => chunk.topicTags.includes(topic))
  ) {
    score += 16;
    reasons.push("offer-ready");
  }

  if (
    input.offerStatus === "no_offer" &&
    ["offer", "contract"].some((topic) => chunk.topicTags.includes(topic))
  ) {
    score += 14;
    reasons.push("offer-early");
  }

  if (input.arrivalWindow === "within_2_weeks" && ["before_arrival", "first_week_in_shanghai"].includes(stageId)) {
    score += 14;
    reasons.push("arrival-soon");
  }

  if (
    input.currentHousingStatus === "short_term_stay" &&
    ["housing", "residence_registration"].some((topic) => chunk.topicTags.includes(topic))
  ) {
    score += 10;
    reasons.push("short-stay");
  }

  if (
    input.currentHousingStatus === "company_housing" &&
    chunk.topicTags.includes("residence_registration")
  ) {
    score += 10;
    reasons.push("company-housing");
  }

  return { score, reasons };
}

export async function retrieveKnowledgeMatches({
  knowledgeBase,
  input,
  stageId,
  limit = 3,
}: {
  knowledgeBase: SurvivalKnowledgeBase;
  input: RouteWizardInput;
  stageId: RouteStageKey;
  limit?: number;
}) {
  const documentsById = new Map(knowledgeBase.documents.map((item) => [item.id, item]));
  const sourcesById = new Map(knowledgeBase.sources.map((item) => [item.id, item]));
  const queryText = getQueryText(stageId, input);
  const queryEmbedding = hasEmbeddingConfig() ? await embedText(queryText) : null;

  const matches: KnowledgeChunkMatch[] = [];

  for (const chunk of knowledgeBase.chunks) {
    if (!includesTag(chunk.cityTags, input.targetCity)) {
      continue;
    }

    if (!includesTag(chunk.personaTags, "fresh_graduate")) {
      continue;
    }

    if (!chunk.stageIds.includes(stageId)) {
      continue;
    }

    const document = documentsById.get(chunk.documentId);

    if (!document) {
      continue;
    }

    const source = sourcesById.get(document.sourceId);

    if (!source) {
      continue;
    }

    const inputScore = scoreForInput(chunk, stageId, input);
    const lexicalScore = keywordScore(chunk, queryText);
    const vectorScore =
      queryEmbedding && chunk.embedding?.length
        ? cosineSimilarity(queryEmbedding, chunk.embedding) * 35
        : 0;

    matches.push({
      chunk,
      document,
      source,
      score: inputScore.score + lexicalScore + vectorScore,
      reasons: [
        ...inputScore.reasons,
        lexicalScore ? "keyword-match" : "",
        vectorScore ? "vector-match" : "",
      ].filter(Boolean),
    });
  }

  return matches.sort((left, right) => right.score - left.score).slice(0, limit);
}

export function citationsFromMatches(matches: KnowledgeChunkMatch[]) {
  const seen = new Set<string>();

  return matches
    .map((match) => toCitation(match))
    .filter((citation) => {
      const key = `${citation.sourceId}:${citation.documentId}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}
