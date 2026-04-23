import { DECISION_PILLAR_LABELS } from "./constants/evaluation";
import type {
  DecisionPillar,
  DecisionPillarAssessment,
  EngineResult,
  EvaluationReport,
  ReportAccuracyFeedback,
  ReportDecisionOutcome,
  RiskItem,
  Verdict,
} from "./types";

export type GuidanceBucket = "hard_stop" | "negotiable" | "verify";

export interface ReportGuidanceItem {
  id: string;
  title: string;
  description: string;
  reason: string;
  nextStep: string;
  sourceLabel: string;
  category: GuidanceBucket;
}

export interface ReportEvidenceNote {
  id: string;
  label: string;
  body: string;
}

export interface ReportGuidance {
  hardStops: ReportGuidanceItem[];
  negotiableItems: ReportGuidanceItem[];
  verifyItems: ReportGuidanceItem[];
  evidenceNotes: ReportEvidenceNote[];
  actionDispatcher: {
    viewingDecision: {
      label: string;
      description: string;
    };
    compareDecision: {
      label: string;
      description: string;
      shouldCompareNow: boolean;
    };
    fallbackAction: {
      label: string;
      description: string;
      href: string;
    };
  };
  vetoItems: string[];
  minimumConditions: string[];
  keyQuestions: string[];
  nextMoves: string[];
  brokerMessage: string;
  supporterMessage: string;
  flow: {
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
  };
}

export interface ReportDecisionFocus {
  verdictLabel: string;
  verdictSummary: string;
  topRiskLabel: string;
  topRisk: string;
  firstQuestion: string;
  primaryAction: string;
}

const HARD_STOP_RISK_IDS = new Set([
  "contract_refused",
  "sublease_chain_unclear",
  "listing_mismatch_major",
  "commute_unsustainable",
  "upfront_cost_burst",
  "cashflow_over_budget",
]);

const VERIFY_RISK_IDS = new Set([
  "cashflow_unverified",
  "commute_unverified",
  "contract_unseen",
  "landlord_identity_unclear",
  "listing_unverified",
  "listing_mismatch_minor",
  "shared_rules_unclear",
  "commute_borderline",
]);

const NEGOTIABLE_RISK_IDS = new Set([
  "cashflow_tight",
  "contract_terms_risky",
  "roommate_boundary_risk",
  "shared_space_conflict",
]);

const RISK_QUESTION_MAP: Record<string, string> = {
  cashflow_over_budget:
    "房租、押付、中介费和水电这些能不能一起重新谈，首付总额最低能压到多少？",
  cashflow_tight:
    "除了月租外，还有哪些固定费用？如果我要继续看，付款方式能不能谈轻一点？",
  cashflow_unverified:
    "这套房的房租、押付、中介费、水电和网费能不能一次说全？我想先把总成本算清。",
  upfront_cost_burst:
    "押金、付款周期和中介费能不能重新谈？如果首付太重，我不会继续推进。",
  commute_unsustainable:
    "工作日早高峰从这里到公司真实要多久？我会自己跑一遍再决定。",
  commute_borderline:
    "这边工作日早高峰和晚高峰通勤真实大概要多久？我想按最累的时候来判断。",
  commute_unverified:
    "到公司工作日高峰单程大概多久？我想先把真实通勤跑一遍。",
  contract_refused:
    "可以先把合同样本发我吗？至少要先确认主体、押付、违约和退租条款。",
  contract_unseen:
    "合同样本能先发我看吗？我想先确认主体、押付、违约和退租条款。",
  contract_terms_risky:
    "合同里这几条我需要先改清楚：违约责任、退租规则、维修责任和提前解约条件。",
  landlord_identity_unclear:
    "这套房到底是谁在出租、谁收款？可以把身份证明或收款主体先给我确认吗？",
  sublease_chain_unclear:
    "如果是转租，能先把原合同或转租授权给我看一下吗？我得确认谁有权出租和收款。",
  listing_unverified:
    "我还没完成现场核实，朝向、面积、房况和公共空间我会现场再确认一遍。",
  listing_mismatch_minor:
    "页面和现场有几处不一致，能不能把朝向、面积和房况差异逐条说清楚？",
  listing_mismatch_major:
    "页面和现场差得比较大，这些差异如果解释不清，我就不会继续推进。",
  shared_rules_unclear:
    "如果是合租，作息、卫生、访客和费用分摊怎么约定？我想先把边界说清楚。",
  shared_space_conflict:
    "公共空间的作息、卫生、访客和分摊规则需要先讲清楚，不然我不会继续推进。",
  roommate_boundary_risk:
    "如果要合租，我想先确认作息、访客、卫生和公共空间边界，再决定要不要继续谈。",
};

const RISK_CONDITION_MAP: Record<string, string> = {
  cashflow_over_budget:
    "总成本要回到你能承受的预算带内，或者把房租、押付、付款周期谈轻。",
  cashflow_tight:
    "把杂费和付款方式讲清楚，确保首月和试用期现金流不会被压穿。",
  cashflow_unverified:
    "先把房租、杂费、押付和中介费算到同一张表里，再谈值不值得继续。",
  upfront_cost_burst:
    "首付压力要降下来，至少把押付或中介费谈到能承受的范围。",
  commute_unsustainable:
    "通勤必须回到你能长期承受的范围，不然住进去后会持续反噬。",
  commute_borderline:
    "先跑一次真实高峰通勤，确认不是地图上的理想值。",
  commute_unverified:
    "先测真实高峰通勤，再决定这套房是否还能继续推进。",
  contract_refused:
    "不提前给合同样本，就不要继续推进。",
  contract_unseen:
    "继续推进前，至少先看到合同样本。",
  contract_terms_risky:
    "合同里的违约、退租、维修责任和提前解约条款要改到能接受。",
  landlord_identity_unclear:
    "先确认谁在出租、谁收款、谁对后续履约负责。",
  sublease_chain_unclear:
    "必须看到转租授权、原合同或合法收款主体。",
  listing_unverified:
    "先完成一次现场核实并留证，再谈值不值得继续。",
  listing_mismatch_minor:
    "把现场和页面不一致的地方逐条问清后，再重新判断。",
  listing_mismatch_major:
    "如果信息失真无法解释，就直接停，不要再为这套房消耗。",
  shared_rules_unclear:
    "把作息、卫生、访客和费用分摊讲清楚，别把边界问题拖到入住后。",
  shared_space_conflict:
    "公共空间规则要先讲透，不然即使签下去也很难住稳。",
  roommate_boundary_risk:
    "作息、访客和公共空间边界要先说死，否则继续推进只会更被动。",
};

const VERDICT_LABELS: Record<Verdict, string> = {
  rent: "继续谈，但别跳过关键核实",
  cautious: "谨慎推进，先把关键证据补齐",
  avoid: "先停，换下一套更划算",
};

const REPORT_DECISION_META: Record<
  Verdict,
  { label: string; summary: string }
> = {
  rent: {
    label: "可以继续推进",
    summary: "这不是直接去签，而是说明这套房值得继续花精力核合同、核主体、核通勤。",
  },
  cautious: {
    label: "谨慎推进",
    summary: "这套房还有继续谈的空间，但必须先把证据补齐，再决定要不要继续投入时间。",
  },
  avoid: {
    label: "先停",
    summary: "当前最省成本的动作不是继续修补，而是停在这里，把时间留给下一套更靠谱的房源。",
  },
};

function getPillarMap(report: Pick<EvaluationReport, "decisionPillars">) {
  return new Map(
    (report.decisionPillars ?? []).map((pillar) => [pillar.pillar, pillar] as const)
  );
}

export function getGuidanceBucketForRisk(risk: RiskItem): GuidanceBucket {
  if (HARD_STOP_RISK_IDS.has(risk.id)) {
    return "hard_stop";
  }

  if (VERIFY_RISK_IDS.has(risk.id)) {
    return "verify";
  }

  if (NEGOTIABLE_RISK_IDS.has(risk.id)) {
    return "negotiable";
  }

  if (risk.severity === "high") {
    return "hard_stop";
  }

  if (risk.source === "decision") {
    return "negotiable";
  }

  return risk.mitigable === false ? "verify" : "negotiable";
}

function getSourceLabel(risk: RiskItem) {
  if (risk.source === "decision" && risk.pillar) {
    return DECISION_PILLAR_LABELS[risk.pillar];
  }

  return "空间体验";
}

function getFallbackQuestion(pillar: DecisionPillarAssessment) {
  return `${DECISION_PILLAR_LABELS[pillar.pillar]}这件事我还需要继续核，请把最关键的条件和边界讲清楚。`;
}

function buildGuidanceItem(
  risk: RiskItem,
  pillarMap: Map<DecisionPillar, DecisionPillarAssessment>
): ReportGuidanceItem {
  const pillar = risk.pillar ? pillarMap.get(risk.pillar) : undefined;
  const category = getGuidanceBucketForRisk(risk);

  const reasonMap: Record<GuidanceBucket, string> = {
    hard_stop: "这类问题在继续推进前就足以把整套判断卡住。",
    negotiable: "这类问题不是立刻出局，但条件变化前不该直接跳过。",
    verify: "这类问题现在还不是结论，而是必须继续补证据。",
  };

  return {
    id: risk.id,
    title: risk.title,
    description: risk.description,
    reason: reasonMap[category],
    nextStep:
      RISK_QUESTION_MAP[risk.id] ??
      (pillar ? pillar.nextStep : "先把关键事实问清，再决定要不要继续推进。"),
    sourceLabel: getSourceLabel(risk),
    category,
  };
}

function getTopQuestions(
  report: Pick<EvaluationReport, "risks" | "decisionPillars">
): string[] {
  const pillarMap = getPillarMap(report);
  const questions = report.risks
    .map((risk) => {
      if (RISK_QUESTION_MAP[risk.id]) {
        return RISK_QUESTION_MAP[risk.id];
      }

      return risk.pillar ? pillarMap.get(risk.pillar)?.nextStep : undefined;
    })
    .filter((item): item is string => Boolean(item));

  if (questions.length > 0) {
    return Array.from(new Set(questions)).slice(0, 3);
  }

  return [...(report.decisionPillars ?? [])]
    .sort((left, right) => left.score - right.score)
    .map((pillar) => getFallbackQuestion(pillar))
    .slice(0, 3);
}

function getConfirmedSignals(report: Pick<EvaluationReport, "input">) {
  const signals: string[] = [];
  const { input } = report;

  if (typeof input.monthlyRent === "number") {
    signals.push(`月租约 ${input.monthlyRent} 元`);
  }
  if (typeof input.estimatedMonthlyBills === "number") {
    signals.push(`杂费约 ${input.estimatedMonthlyBills} 元 / 月`);
  }
  if (typeof input.commuteMinutes === "number") {
    signals.push(`通勤按 ${input.commuteMinutes} 分钟估算`);
  }
  if (input.contractVisibility) {
    signals.push(`合同状态：${input.contractVisibility}`);
  }
  if (input.landlordType) {
    signals.push(`出租主体：${input.landlordType}`);
  }
  if (input.listingMatchLevel) {
    signals.push(`房源核验状态：${input.listingMatchLevel}`);
  }
  if (input.isShared) {
    signals.push("当前按合租场景判断");
  }

  return signals.slice(0, 4);
}

function buildEvidenceNotes(
  report: Pick<EvaluationReport, "input" | "verdict" | "decisionPillars" | "risks">
): ReportEvidenceNote[] {
  const notes: ReportEvidenceNote[] = [];
  const confirmedSignals = getConfirmedSignals(report);
  const weakestPillars = [...(report.decisionPillars ?? [])]
    .sort((left, right) => left.score - right.score)
    .slice(0, 2);
  const verifyItems = report.risks.filter(
    (risk) => getGuidanceBucketForRisk(risk) === "verify"
  );
  const negotiableItems = report.risks.filter(
    (risk) => getGuidanceBucketForRisk(risk) === "negotiable"
  );

  if (confirmedSignals.length > 0) {
    notes.push({
      id: "confirmed-signals",
      label: "哪些判断来自你已确认的信息",
      body: confirmedSignals.join("，"),
    });
  }

  if (weakestPillars.length > 0) {
    notes.push({
      id: "rule-signals",
      label: "哪些判断来自规则推断",
      body: weakestPillars
        .map(
          (pillar) =>
            `${DECISION_PILLAR_LABELS[pillar.pillar]}被判为「${pillar.headline}」`
        )
        .join("；"),
    });
  }

  if (verifyItems.length > 0) {
    notes.push({
      id: "assumptions",
      label: "哪些结论还依赖待核实或默认假设",
      body: `当前还有这些点没完全落地：${verifyItems
        .slice(0, 3)
        .map((item) => item.title)
        .join("、")}。`,
    });
  }

  if (negotiableItems.length > 0) {
    notes.push({
      id: "changeable",
      label: "哪些条件变化后，判断可能变化",
      body: negotiableItems
        .slice(0, 3)
        .map((item) => RISK_CONDITION_MAP[item.id] ?? item.title)
        .join("；"),
    });
  }

  if (notes.length === 0) {
    notes.push({
      id: "stable",
      label: "为什么这次判断相对稳定",
      body: `当前建议是「${VERDICT_LABELS[report.verdict]}」，主要风险里没有特别明显的证据缺口。`,
    });
  }

  return notes.slice(0, 4);
}

function getVetoItems(hardStops: ReportGuidanceItem[]) {
  if (hardStops.length === 0) {
    return ["如果合同、主体和现场核验后来出现红灯，这份判断要立刻停下重算。"];
  }

  return hardStops.slice(0, 3).map((item) => item.title);
}

function getMinimumConditions(
  report: Pick<EvaluationReport, "risks" | "decisionPillars">
) {
  const items = report.risks
    .filter((risk) => getGuidanceBucketForRisk(risk) !== "hard_stop")
    .map((risk) => RISK_CONDITION_MAP[risk.id] ?? risk.title);

  if (items.length > 0) {
    return Array.from(new Set(items)).slice(0, 4);
  }

  const weakest = [...(report.decisionPillars ?? [])].sort(
    (left, right) => left.score - right.score
  )[0];

  return weakest
    ? [`先把${DECISION_PILLAR_LABELS[weakest.pillar]}补稳，再决定要不要继续推进。`]
    : ["继续推进前，至少先把合同、主体和现场证据补齐。"];
}

function getNextMoves(report: EvaluationReport) {
  const verifyCount = report.risks.filter(
    (risk) => getGuidanceBucketForRisk(risk) === "verify"
  ).length;

  if (report.verdict === "avoid") {
    return [
      "先停，不要继续交定金或推进签约。",
      "回到速读或手动评估，换下一套房继续看。",
      "顺手把这次踩到的坑记进“如何租房”那类场景，下次看房少吃亏。",
    ];
  }

  if (report.verdict === "cautious" || verifyCount > 0) {
    return [
      "先复制下面的核实问题去问中介、房东或室友。",
      "把合同、主体、现场和通勤证据补齐后，再回来重看这份判断。",
      "如果手上已经有第二套房，去 compare 做取舍更划算。",
    ];
  }

  return [
    "可以继续推进，但别跳过合同、主体和付款条件复核。",
    "如果手上不止一套房，去 compare 做最后取舍。",
    "如果已经准备来上海，再打开到沪路线图承接后续动作。",
  ];
}

function buildActionDispatcher(report: EvaluationReport) {
  if (report.verdict === "avoid") {
      return {
        viewingDecision: {
        label: "现在不值得继续谈",
        description:
          "这次更省成本的动作不是硬着头皮去看，而是停在这里，把时间留给下一套更靠谱的房源。",
      },
      compareDecision: {
        label: "先别让它继续占 compare 位",
        description:
          "这套房当前更像明确止损对象。除非你要拿它当反例，不然先别让它继续占你的判断带宽。",
        shouldCompareNow: false,
      },
      fallbackAction: {
        label: "回主链继续筛下一套",
        description:
          "最值钱的动作是回到链接速读或手动评估，把这次踩到的坑直接带进下一轮筛房。",
        href: "/rent/tools/analyze",
      },
    };
  }

  if (report.verdict === "cautious") {
    return {
      viewingDecision: {
        label: "先线上核清，再决定要不要去看",
        description:
          "这套房还没到直接安排看房的阶段。先把合同、主体、押付和通勤这些硬条件问清，再决定值不值得跑一趟。",
      },
      compareDecision: {
        label: "手上还有备选，就把它放进 compare",
        description:
          "这类房最怕孤立判断。把它和另一套一起比，能更快看出到底是补证据还是直接换房更划算。",
        shouldCompareNow: true,
      },
      fallbackAction: {
        label: "补证据后再重算，别靠感觉推进",
        description:
          "先把这次缺口补齐，再回到手动评估重跑一次，比带着模糊信息继续谈更稳。",
        href: "/rent/tools/evaluate",
      },
    };
  }

  return {
    viewingDecision: {
      label: "值得继续去看，但要带着清单去",
      description:
        "这份结果支持继续推进，但不等于闭眼签。去现场前把要问的 3 个问题和底线条件带上，避免现场被节奏带走。",
    },
    compareDecision: {
      label: "值得加入 compare，看它是不是当前最优",
      description:
        "这套房已经到了值得认真取舍的阶段。如果你手上不止一套候选，现在就该放进 compare 做最后拍板。",
      shouldCompareNow: true,
    },
    fallbackAction: {
      label: "如果后来放弃，立刻回到筛房而不是原地纠结",
      description:
        "这套房就算后来谈崩，也别把判断断在这里。直接回到筛房主链，沿用这次核验清单继续排下一套。",
      href: "/rent/tools/analyze",
    },
  };
}

function getFlow(report: EvaluationReport) {
  if (report.verdict === "avoid") {
    return {
      primaryHref: "/rent/tools/analyze",
      primaryLabel: "换一个房源继续筛",
      secondaryHref: "/scenario/how-to-rent-house",
      secondaryLabel: "看下次看房别漏什么",
    };
  }

  if (report.verdict === "cautious") {
    return {
      primaryHref: "/rent/tools/evaluate",
      primaryLabel: "补齐证据后重算一次",
      secondaryHref: "/rent/tools/compare",
      secondaryLabel: "去 compare 做取舍",
    };
  }

  return {
    primaryHref: "/rent/tools/compare",
    primaryLabel: "去 compare 做最后取舍",
    secondaryHref: "/survival-plans/start",
    secondaryLabel: "去到沪路线图继续承接",
  };
}

function buildBrokerMessage(report: EvaluationReport, questions: string[]) {
  return [
    "我继续推进前，想先把这几件事确认清楚：",
    ...questions.map((item, index) => `${index + 1}. ${item}`),
    "这些点确认清楚后，我再决定要不要继续谈和签约。",
  ].join("\n");
}

function buildSupporterMessage(report: EvaluationReport, questions: string[]) {
  const summary = buildPortableShareSummary(report);
  const prompt = questions.length
    ? `你帮我重点看看这两件事：${questions.slice(0, 2).join("；")}`
    : "你帮我看看这套房到底值不值得继续推进。";

  return `${summary}\n${prompt}`;
}

export function buildPortableShareSummary(
  report: Pick<
    EngineResult,
    "verdict" | "overallScore" | "risks" | "decisionPillars" | "actions"
  >
) {
  const keyRisks = report.risks.slice(0, 3).map((risk) => risk.title);
  const keyQuestions = getTopQuestions({
    risks: report.risks,
    decisionPillars: report.decisionPillars,
  }).slice(0, 2);
  const weakestPillar = [...(report.decisionPillars ?? [])].sort(
    (left, right) => left.score - right.score
  )[0];
  const nextAction =
    report.actions[0]?.title ??
    weakestPillar?.nextStep ??
    "先把合同、主体和现场证据补齐后再决定。";

  return [
    `建议：${VERDICT_LABELS[report.verdict]}。 综合判断 ${report.overallScore}/100。`,
    keyRisks.length > 0
      ? `关键风险：${keyRisks.join("；")}。`
      : "当前没看到明显一票否决项，但还不能闭眼推进。",
    keyQuestions.length > 0 ? `先核实：${keyQuestions.join("；")}。` : null,
    `下一步：${nextAction}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildReportGuidance(report: EvaluationReport): ReportGuidance {
  const pillarMap = getPillarMap(report);
  const items = report.risks.map((risk) => buildGuidanceItem(risk, pillarMap));
  const hardStops = items.filter((item) => item.category === "hard_stop");
  const negotiableItems = items.filter((item) => item.category === "negotiable");
  const verifyItems = items.filter((item) => item.category === "verify");
  const keyQuestions = getTopQuestions(report);

  return {
    hardStops,
    negotiableItems,
    verifyItems,
    evidenceNotes: buildEvidenceNotes(report),
    actionDispatcher: buildActionDispatcher(report),
    vetoItems: getVetoItems(hardStops),
    minimumConditions: getMinimumConditions(report),
    keyQuestions,
    nextMoves: getNextMoves(report),
    brokerMessage: buildBrokerMessage(report, keyQuestions),
    supporterMessage: buildSupporterMessage(report, keyQuestions),
    flow: getFlow(report),
  };
}

export function buildReportDecisionFocus(
  report: EvaluationReport
): ReportDecisionFocus {
  const guidance = buildReportGuidance(report);
  const reportDecision = REPORT_DECISION_META[report.verdict];
  const topHardStop = guidance.hardStops[0];
  const topRisk = report.risks[0];
  const weakestPillar = [...(report.decisionPillars ?? [])].sort(
    (left, right) => left.score - right.score
  )[0];

  return {
    verdictLabel: reportDecision.label,
    verdictSummary: reportDecision.summary,
    topRiskLabel: topHardStop ? "当前最大的停损点" : "当前最该记住的风险",
    topRisk:
      topHardStop?.title ??
      topRisk?.title ??
      report.decisionNote?.title ??
      report.decisionSnapshot.headline ??
      report.decisionSnapshot.topEvidence[0],
    firstQuestion:
      guidance.keyQuestions[0] ??
      weakestPillar?.nextStep ??
      report.decisionSnapshot.topEvidence[0] ??
      "先把关键事实问清，再决定要不要继续推进。",
    primaryAction: report.decisionSnapshot.nextAction,
  };
}

export function shouldAskFeedbackNote(
  decisionOutcome?: ReportDecisionOutcome,
  accuracyFeedback?: ReportAccuracyFeedback
) {
  return (
    decisionOutcome === "signed_elsewhere" ||
    decisionOutcome === "rented" ||
    decisionOutcome === "not_rented" ||
    accuracyFeedback === "missed_risk" ||
    accuracyFeedback === "got_burned"
  );
}

export function getFeedbackNotePlaceholder(
  decisionOutcome?: ReportDecisionOutcome,
  accuracyFeedback?: ReportAccuracyFeedback
) {
  if (accuracyFeedback === "missed_risk") {
    return "后来发现最真实的遗漏风险是什么？一句话就行。";
  }

  if (accuracyFeedback === "got_burned") {
    return "后来真正踩到的坑是什么？一句话补给系统就够。";
  }

  if (decisionOutcome === "rented") {
    return "最后是哪一点让你决定租下这套房？";
  }

  if (decisionOutcome === "signed_elsewhere") {
    return "最后是什么让你转去签了另一套房？";
  }

  if (decisionOutcome === "not_rented") {
    return "最后是哪一点让你决定不租？";
  }

  return "如果愿意，可以补一句后来最关键的真实情况。";
}
