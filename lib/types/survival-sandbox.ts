import { z } from "zod";

export const SURVIVAL_SUPPORTED_CITY = "shanghai";
export const SURVIVAL_SUPPORTED_PERSONA = "fresh_graduate";

export const routeStageKeys = [
  "before_offer",
  "after_offer",
  "before_arrival",
  "first_week_in_shanghai",
  "housing",
  "onboarding",
  "social_insurance",
  "hukou_watchouts",
] as const;

export const offerStatusValues = [
  "no_offer",
  "verbal_offer",
  "signed_offer",
  "already_onboarded",
] as const;

export const arrivalWindowValues = [
  "within_2_weeks",
  "this_month",
  "next_1_3_months",
  "not_sure",
] as const;

export const hukouInterestValues = ["strong_yes", "maybe", "not_now"] as const;

export const housingStatusValues = [
  "campus",
  "with_family",
  "company_housing",
  "short_term_stay",
  "already_renting",
] as const;

export const confidenceValues = ["high", "medium", "low"] as const;

export type RouteStageKey = (typeof routeStageKeys)[number];
export type OfferStatus = (typeof offerStatusValues)[number];
export type ArrivalWindow = (typeof arrivalWindowValues)[number];
export type HukouInterest = (typeof hukouInterestValues)[number];
export type CurrentHousingStatus = (typeof housingStatusValues)[number];
export type PlanConfidence = (typeof confidenceValues)[number];

export const RouteWizardInputSchema = z.object({
  targetCity: z.string().trim().min(1).default(SURVIVAL_SUPPORTED_CITY),
  originCity: z.string().trim().min(2).max(40),
  graduationDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "graduationDate must be YYYY-MM-DD"),
  offerStatus: z.enum(offerStatusValues),
  arrivalWindow: z.enum(arrivalWindowValues),
  housingBudget: z.string().trim().min(1).max(40),
  hukouInterest: z.enum(hukouInterestValues),
  currentHousingStatus: z.enum(housingStatusValues),
});

export type RouteWizardInput = z.infer<typeof RouteWizardInputSchema>;

export interface KnowledgeSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  sourceType: "policy" | "service_guide" | "faq" | "law" | "news";
  city: string;
  publishedAt: string;
  effectiveAt?: string | null;
  reviewedAt: string;
  note?: string;
}

export interface KnowledgeDocument {
  id: string;
  sourceId: string;
  title: string;
  summary: string;
  cityTags: string[];
  personaTags: string[];
  topicTags: string[];
  versionTag: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  title: string;
  content: string;
  whyItMatters: string;
  actions: string[];
  requiredMaterials: string[];
  deadlineOrTrigger: string;
  topicTags: string[];
  stageIds: RouteStageKey[];
  cityTags: string[];
  personaTags: string[];
  keywords: string[];
  confidence: PlanConfidence;
  verificationRequired: boolean;
  priority: number;
  embedding?: number[] | null;
}

export interface KnowledgeChunkMatch {
  chunk: KnowledgeChunk;
  document: KnowledgeDocument;
  source: KnowledgeSource;
  score: number;
  reasons: string[];
}

export interface RouteCitation {
  sourceId: string;
  documentId: string;
  sourceTitle: string;
  documentTitle: string;
  publisher: string;
  url: string;
  city: string;
  publishedAt: string;
  effectiveAt?: string | null;
  reviewedAt: string;
  note?: string;
}

export interface RoutePlanStep {
  id: string;
  title: string;
  whyItMatters: string;
  actions: string[];
  requiredMaterials: string[];
  deadlineOrTrigger: string;
  citations: RouteCitation[];
  confidence: PlanConfidence;
  verificationRequired: boolean;
  topicTags: string[];
}

export interface RoutePlanStage {
  id: RouteStageKey;
  label: string;
  description: string;
  status: "now" | "next" | "later" | "watch";
  steps: RoutePlanStep[];
}

export interface RoutePlanSummary {
  headline: string;
  deck: string;
  currentFocus: string;
  caution: string;
}

export interface RoutePlan {
  id: string;
  city: string;
  persona: string;
  generatedAt: string;
  knowledgeVersion: string;
  input: RouteWizardInput;
  summary: RoutePlanSummary;
  stages: RoutePlanStage[];
  supportingSources: RouteCitation[];
  fallbackUsed: boolean;
}

export interface SurvivalKnowledgeBase {
  version: string;
  sources: KnowledgeSource[];
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
}

export interface SurvivalKnowledgeSeedPayload {
  exportedAt: string;
  counts: {
    knowledge_sources: number;
    knowledge_documents: number;
    knowledge_chunks: number;
  };
  tables: {
    knowledge_sources: Array<{
      id: string;
      title: string;
      publisher: string;
      url: string;
      source_type: KnowledgeSource["sourceType"];
      city: string;
      published_at: string;
      effective_at: string | null;
      reviewed_at: string;
      note: string | null;
    }>;
    knowledge_documents: Array<{
      id: string;
      source_id: string;
      title: string;
      summary: string;
      city_tags: string[];
      persona_tags: string[];
      topic_tags: string[];
      version_tag: string;
    }>;
    knowledge_chunks: Array<{
      id: string;
      document_id: string;
      title: string;
      content: string;
      why_it_matters: string;
      actions: string[];
      required_materials: string[];
      deadline_or_trigger: string;
      topic_tags: string[];
      stage_ids: RouteStageKey[];
      city_tags: string[];
      persona_tags: string[];
      keywords: string[];
      confidence: PlanConfidence;
      verification_required: boolean;
      priority: number;
      embedding: number[] | null;
    }>;
  };
}
