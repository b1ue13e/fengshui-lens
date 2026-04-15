import { routeStageMeta } from "./config";
import { citationsFromMatches, retrieveKnowledgeMatches } from "./retrieval";
import {
  SURVIVAL_SUPPORTED_CITY,
  SURVIVAL_SUPPORTED_PERSONA,
  routeStageKeys,
  type KnowledgeChunkMatch,
  type RoutePlan,
  type RoutePlanStage,
  type RoutePlanStep,
  type RouteStageKey,
  type RouteWizardInput,
  type SurvivalKnowledgeBase,
} from "../types/survival-sandbox";

function createPlanId() {
  return crypto.randomUUID();
}

function buildStageStatus(stageId: RouteStageKey, input: RouteWizardInput): RoutePlanStage["status"] {
  if (stageId === "hukou_watchouts") {
    return input.hukouInterest === "not_now" ? "later" : "watch";
  }

  if (input.offerStatus === "already_onboarded") {
    if (stageId === "social_insurance" || stageId === "onboarding") {
      return "now";
    }

    if (stageId === "first_week_in_shanghai" || stageId === "housing") {
      return "next";
    }

    return "later";
  }

  if (input.offerStatus === "signed_offer") {
    if (["before_arrival", "first_week_in_shanghai", "housing"].includes(stageId)) {
      return "now";
    }

    if (["onboarding", "social_insurance"].includes(stageId)) {
      return "next";
    }

    return "later";
  }

  if (stageId === "before_offer") {
    return "now";
  }

  if (stageId === "after_offer") {
    return input.offerStatus === "verbal_offer" ? "now" : "next";
  }

  if (["before_arrival", "housing"].includes(stageId)) {
    return input.arrivalWindow === "within_2_weeks" ? "next" : "later";
  }

  return stageId === "social_insurance" ? "later" : "next";
}

function personalizeStageDescription(stageId: RouteStageKey, input: RouteWizardInput) {
  if (stageId === "housing") {
    return `${routeStageMeta[stageId].description} 你的当前预算输入是“${input.housingBudget}”，所以这里会更强调证明链和退租路径，而不是只拼低价。`;
  }

  if (stageId === "hukou_watchouts") {
    const suffix =
      input.hukouInterest === "not_now"
        ? "你现在不把落户当第一优先，但仍要防止签约时把后路签没。"
        : "你把落户保留在决策里，所以这一段会把风险位单独拎出来。";
    return `${routeStageMeta[stageId].description} ${suffix}`;
  }

  if (stageId === "first_week_in_shanghai") {
    return `${routeStageMeta[stageId].description} 你当前的落脚状态是“${input.currentHousingStatus}”。`;
  }

  return routeStageMeta[stageId].description;
}

function extraActionForStep(stageId: RouteStageKey, input: RouteWizardInput) {
  if (stageId === "housing" && input.currentHousingStatus === "short_term_stay") {
    return "如果先住酒店或短租，尽快确认下一处住址能不能给出合法居住证明，不然第一周很多事会卡住。";
  }

  if (stageId === "social_insurance" && input.offerStatus === "already_onboarded") {
    return "你已经入职，优先把首月工资条、社保记录和公积金查询结果做一次交叉核对。";
  }

  if (stageId === "before_offer" && input.hukouInterest === "strong_yes") {
    return "你把落户看得比较重，任何“以后再说”的口头承诺都应该追成书面回复。";
  }

  return null;
}

function buildStep(match: KnowledgeChunkMatch, input: RouteWizardInput, stageId: RouteStageKey): RoutePlanStep {
  const extraAction = extraActionForStep(stageId, input);
  const citations = citationsFromMatches([match]);

  return {
    id: `${stageId}-${match.chunk.id}`,
    title: match.chunk.title,
    whyItMatters: match.chunk.whyItMatters,
    actions: extraAction ? [extraAction, ...match.chunk.actions] : match.chunk.actions,
    requiredMaterials: match.chunk.requiredMaterials,
    deadlineOrTrigger: match.chunk.deadlineOrTrigger,
    citations,
    confidence: citations.length ? match.chunk.confidence : "low",
    verificationRequired: match.chunk.verificationRequired || citations.length === 0,
    topicTags: match.chunk.topicTags,
  };
}

function buildFallbackStep(stageId: RouteStageKey): RoutePlanStep {
  return {
    id: `${stageId}-manual-verify`,
    title: "这一步先回到官方入口核实最新要求",
    whyItMatters:
      "当前知识库没有给出足够稳的命中结果，这类政策或办事细节不应该靠模型猜。",
    actions: ["打开对应官方办事页重新核对材料、时限和入口，再决定下一步。"],
    requiredMaterials: ["官方入口页面", "当前个人材料清单"],
    deadlineOrTrigger: "遇到信息不一致、页面改版或跨年份办理时。",
    citations: [],
    confidence: "low",
    verificationRequired: true,
    topicTags: ["manual_verification"],
  };
}

async function buildStage(
  stageId: RouteStageKey,
  input: RouteWizardInput,
  knowledgeBase: SurvivalKnowledgeBase
) {
  const matches = await retrieveKnowledgeMatches({
    knowledgeBase,
    input,
    stageId,
    limit: stageId === "social_insurance" ? 3 : 2,
  });

  const steps = matches.length
    ? matches.map((match) => buildStep(match, input, stageId))
    : [buildFallbackStep(stageId)];

  return {
    id: stageId,
    label: routeStageMeta[stageId].label,
    description: personalizeStageDescription(stageId, input),
    status: buildStageStatus(stageId, input),
    steps,
  } satisfies RoutePlanStage;
}

function buildSummary(input: RouteWizardInput, stages: RoutePlanStage[]) {
  const firstNow = stages.find((stage) => stage.status === "now");

  return {
    headline: `${input.originCity}出发，到上海落脚的应届生路线图`,
    deck: `按“${input.offerStatus} -> ${input.arrivalWindow} -> ${input.currentHousingStatus}”这条现实路径排出的行动顺序，优先级围绕证据链、时效和可核验信息展开。`,
    currentFocus:
      firstNow?.steps[0]?.title ||
      "先把签约边界、住处证明和第一周要核实的事项排出来。",
    caution:
      input.hukouInterest === "strong_yes"
        ? "落户相关内容带有年度性，跨年度申请前务必回到当年官方通知复核。"
        : "即使暂时不冲落户，也不要在签约时把之后可能需要的路径直接签没。",
  };
}

function collectSupportingSources(stages: RoutePlanStage[]) {
  const seen = new Set<string>();

  return stages
    .flatMap((stage) => stage.steps.flatMap((step) => step.citations))
    .filter((citation) => {
      const key = `${citation.sourceId}:${citation.documentId}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

function createOutOfScopePlan(input: RouteWizardInput): RoutePlan {
  const generatedAt = new Date().toISOString();

  return {
    id: createPlanId(),
    city: input.targetCity,
    persona: SURVIVAL_SUPPORTED_PERSONA,
    generatedAt,
    knowledgeVersion: "local-fallback",
    input,
    summary: {
      headline: `${input.targetCity} 目前不在这版样板城市范围内`,
      deck: "这次 V1 只把上海应届生链路做透，避免把别的城市也伪装成“已核实”的定制答案。",
      currentFocus: "先回到通用资源库学习，再等待扩城版本。",
      caution: "不同城市的户籍、租住和社保入口差异很大，先不要套用上海结论。",
    },
    stages: routeStageKeys.map((stageId) => ({
      id: stageId,
      label: routeStageMeta[stageId].label,
      description: "该城市暂未接入核验后的知识库，请先使用通用内容。",
      status: stageId === "before_offer" ? "now" : "later",
      steps: [buildFallbackStep(stageId)],
    })),
    supportingSources: [],
    fallbackUsed: true,
  };
}

export async function createRoutePlan({
  input,
  knowledgeBase,
  planId,
}: {
  input: RouteWizardInput;
  knowledgeBase: SurvivalKnowledgeBase;
  planId?: string;
}) {
  if (input.targetCity !== SURVIVAL_SUPPORTED_CITY) {
    return createOutOfScopePlan(input);
  }

  const generatedAt = new Date().toISOString();
  const stages = await Promise.all(
    routeStageKeys.map((stageId) => buildStage(stageId, input, knowledgeBase))
  );

  return {
    id: planId ?? createPlanId(),
    city: SURVIVAL_SUPPORTED_CITY,
    persona: SURVIVAL_SUPPORTED_PERSONA,
    generatedAt,
    knowledgeVersion: knowledgeBase.version,
    input,
    summary: buildSummary(input, stages),
    stages,
    supportingSources: collectSupportingSources(stages),
    fallbackUsed: false,
  } satisfies RoutePlan;
}
