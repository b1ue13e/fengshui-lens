import { DECISION_PILLAR_LABELS } from "./constants/evaluation";
import type {
  DecisionPillar,
  DecisionPillarAssessment,
  Dimension,
  EvaluationInput,
  PrimaryGoal,
  RiskItem,
} from "./types";

type PillarDraft = {
  assessment: DecisionPillarAssessment;
  risk?: RiskItem;
};

const budgetLimitMap = {
  low: 3500,
  medium: 6500,
  high: 9500,
} as const;

const paymentMonthsMap = {
  monthly: 1,
  every_two_months: 2,
  quarterly: 3,
  half_yearly: 6,
} as const;

const pillarDimensionMap: Record<DecisionPillar, Dimension> = {
  cash_flow: "circulation",
  commute: "circulation",
  contract: "privacy",
  listing_trust: "focus",
  flatshare: "privacy",
};

const pillarWeightMap: Record<DecisionPillar, number> = {
  cash_flow: 1.4,
  commute: 1.2,
  contract: 1.4,
  listing_trust: 1.1,
  flatshare: 0.9,
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getPillarStatus(score: number): DecisionPillarAssessment["status"] {
  if (score < 55) {
    return "danger";
  }

  if (score < 72) {
    return "verify";
  }

  return "solid";
}

function buildPillarAssessment(
  pillar: DecisionPillar,
  score: number,
  headline: string,
  summary: string,
  evidence: string[],
  nextStep: string
): DecisionPillarAssessment {
  return {
    pillar,
    label: DECISION_PILLAR_LABELS[pillar],
    score: clampScore(score),
    status: getPillarStatus(score),
    headline,
    summary,
    evidence: evidence.slice(0, 3),
    nextStep,
  };
}

function buildDecisionRisk(
  pillar: DecisionPillar,
  id: string,
  title: string,
  description: string,
  severity: RiskItem["severity"],
  modernReason?: string
): RiskItem {
  return {
    id,
    severity,
    dimension: pillarDimensionMap[pillar],
    title,
    description,
    modernReason,
    source: "decision",
    pillar,
  };
}

function assessCashFlow(input: EvaluationInput): PillarDraft {
  const evidence: string[] = [];
  const monthlyRent = input.monthlyRent ?? 0;
  const estimatedMonthlyBills = input.estimatedMonthlyBills ?? 0;
  const depositMonths = input.depositMonths ?? 1;
  const agentFeeMonths = input.agentFeeMonths ?? 0;
  const paymentCycle = input.paymentCycle ?? "monthly";
  const totalMonthly = monthlyRent + estimatedMonthlyBills;
  const budgetLimit = budgetLimitMap[input.monthlyBudget];
  const paymentMonths = paymentMonthsMap[paymentCycle];
  const upfrontMonths = depositMonths + agentFeeMonths + paymentMonths;
  let score = 78;
  let headline = "现金流暂时可控";
  let summary = "月租、杂费和搬入成本都还在可承受带宽内。";
  let nextStep = "继续把合同条款和通勤一起核清，避免只看房间本身。";
  let risk: RiskItem | undefined;

  if (monthlyRent <= 0) {
    score = 60;
    headline = "总成本还没算清";
    summary = "现在还没有把月租、杂费和一次性搬入支出放进同一张表。";
    nextStep = "先把月租、物业、水电网、押金、中介费和首付月数一起列清。";
    evidence.push("月租尚未填写，当前无法判断现金流压力。");
    risk = buildDecisionRisk(
      "cash_flow",
      "cashflow_unverified",
      "总成本还没算清",
      "在签约前没有把月租、杂费和一次性搬入成本算清，容易低估现金流压力。",
      "medium",
      "第一次来上海最容易踩的坑，不是房间不好，而是首月支出超出手头现金。"
    );
  } else {
    const budgetRatio = totalMonthly / budgetLimit;
    evidence.push(
      "预计每月总支出约 " +
        totalMonthly +
        " 元，对应你的预算带宽上限 " +
        budgetLimit +
        " 元。"
    );
    evidence.push("一次性搬入支出约等于 " + upfrontMonths.toFixed(1) + " 个月房租。");

    if (budgetRatio > 1.1) {
      score -= 26;
      headline = "总成本已经明显超出预算带宽";
      summary = "房租加杂费已经压到当前承受区间之外，后续很容易在现金流上被动。";
      nextStep = "优先谈价格或换房，不要指望靠省其他开销硬扛。";
      risk = buildDecisionRisk(
        "cash_flow",
        "cashflow_over_budget",
        "总成本超出预算带宽",
        "房租和每月固定支出已经超出当前预算区间，入职前后很容易顶不住。",
        "high",
        "住得下不等于撑得住，尤其是押付和刚到上海的前几周现金压力会放大。"
      );
    } else if (budgetRatio > 0.95) {
      score -= 14;
      headline = "总成本已经贴着预算上限";
      summary = "房租本身不一定离谱，但杂费和临时支出一叠上来就容易超线。";
      nextStep = "把水电网、通勤和首月支出一起算，不要只盯挂牌月租。";
      risk = buildDecisionRisk(
        "cash_flow",
        "cashflow_tight",
        "总成本贴近预算上限",
        "当前房租方案已经贴近预算天花板，现金流弹性很小。",
        "medium",
        "真正压垮决策的往往不是月租一个数字，而是杂费和一次性支出的组合。"
      );
    } else if (budgetRatio < 0.7) {
      score += 6;
      evidence.push("月租和杂费距离当前预算上限还有安全边际。");
    }

    if (upfrontMonths >= 5) {
      score -= 18;
      headline = "搬入首付压力过大";
      summary = "押金、付款周期和中介费叠在一起后，首月现金流压力会非常重。";
      nextStep = "优先核实能否改成更短付款周期，或直接换掉首付更轻的房源。";
      risk = buildDecisionRisk(
        "cash_flow",
        "upfront_cost_burst",
        "搬入首付压力过大",
        "押金、付款周期和中介费叠加后，一次性需要拿出的金额太高。",
        "high",
        "刚到上海时现金流最怕被首付一次性抽干，后面遇到入职延迟或临时支出会更难受。"
      );
    } else if (upfrontMonths >= 4) {
      score -= 10;
      evidence.push("搬入首付已经偏重，建议把押付和中介费重新谈一遍。");
    }

    if (agentFeeMonths >= 1) {
      score -= 8;
      evidence.push("中介费约 " + agentFeeMonths + " 个月房租，需要单独算入搬入成本。");
    }

    if (paymentCycle === "quarterly" || paymentCycle === "half_yearly") {
      score -= paymentCycle === "half_yearly" ? 16 : 10;
      evidence.push("当前付款方式为 " + paymentMonths + " 个月一付，对首付压力非常敏感。");
    }
  }

  return {
    assessment: buildPillarAssessment("cash_flow", score, headline, summary, evidence, nextStep),
    risk,
  };
}

function getCommuteTarget(tolerance: EvaluationInput["commuteTolerance"]) {
  switch (tolerance) {
    case "under_30":
      return 30;
    case "under_45":
      return 45;
    case "under_60":
      return 60;
    case "flexible":
    default:
      return 75;
  }
}

function assessCommute(input: EvaluationInput): PillarDraft {
  const evidence: string[] = [];
  const commuteMinutes = input.commuteMinutes ?? 0;
  let score = 76;
  let headline = "通勤还在可接受区间";
  let summary = "当前通勤时间没有明显压垮日常节奏。";
  let nextStep = "用真实高峰时段再跑一次，确认不是地图的理想值。";
  let risk: RiskItem | undefined;

  if (commuteMinutes <= 0) {
    score = 60;
    headline = "通勤还没做实测";
    summary = "现在还没有把真实高峰通勤时间算进去，容易误判每天的消耗。";
    nextStep = "至少跑一遍工作日早高峰，别只看地图默认值。";
    evidence.push("通勤分钟数尚未填写，当前无法判断日常体力消耗。");
    risk = buildDecisionRisk(
      "commute",
      "commute_unverified",
      "通勤时间未确认",
      "当前还没有确认高峰通勤时间，无法判断这套房能不能长期撑住。",
      "medium",
      "毕业生第一份工作的房子，最怕的是住得下但每天通勤把人耗空。"
    );
  } else {
    const target = getCommuteTarget(input.commuteTolerance);
    const gap = commuteMinutes - target;
    evidence.push(
      "当前预计单程通勤 " +
        commuteMinutes +
        " 分钟，你给自己的上限是 " +
        target +
        " 分钟。"
    );

    if (gap > 20) {
      score -= 28;
      headline = "通勤已经超出可承受区间";
      summary = "不是偶尔绕一点，而是每天都要为这套房多付出体力和时间。";
      nextStep = "优先换更近的片区，别指望靠意志力硬扛长期通勤。";
      risk = buildDecisionRisk(
        "commute",
        "commute_unsustainable",
        "通勤超过可承受区间",
        "当前通勤时间已经明显超出你的上限，长期很难稳定维持。",
        "high",
        "通勤问题不像噪音还能补救，它会在每天上下班里反复收利息。"
      );
    } else if (gap > 5) {
      score -= 14;
      headline = "通勤已经开始吃掉日常余量";
      summary = "还没到完全不能住，但每天都要为距离多承担一点疲惫。";
      nextStep = "把高峰通勤、加班回程和雨天替代路线一起测一遍。";
      risk = buildDecisionRisk(
        "commute",
        "commute_borderline",
        "通勤接近失控边缘",
        "当前通勤已经明显接近你的承受边界，需要实测确认。",
        "medium",
        "地图上的 45 分钟和真实上下班的 45 分钟，体感可能完全不是一回事。"
      );
    } else if (gap <= -10) {
      score += 8;
      evidence.push("通勤还有缓冲，后续更有空间处理加班或换岗变化。");
    }
  }

  return {
    assessment: buildPillarAssessment("commute", score, headline, summary, evidence, nextStep),
    risk,
  };
}

function assessContract(input: EvaluationInput): PillarDraft {
  const evidence: string[] = [];
  const landlordType = input.landlordType ?? "unknown";
  const contractVisibility = input.contractVisibility ?? "not_reviewed";
  const depositMonths = input.depositMonths ?? 1;
  const paymentCycle = input.paymentCycle ?? "monthly";
  const agentFeeMonths = input.agentFeeMonths ?? 0;
  let score = 80;
  let headline = "合同和主体暂时还算稳";
  let summary = "至少关键主体、押付和合同可见性没有明显异常。";
  let nextStep = "继续把违约、退押和维修责任条款看细，不要只看月租数字。";
  let risk: RiskItem | undefined;

  evidence.push("房源主体当前识别为 " + landlordType + "。");

  if (landlordType === "sublessor") {
    score -= 24;
    headline = "二房东 / 转租链路要重点核验";
    summary = "只要主体链路和转租授权不清楚，后续退押和履约都更容易出问题。";
    nextStep = "要求看到原始合同、授权证明和收款主体，不清楚就不要推进。";
    risk = buildDecisionRisk(
      "contract",
      "sublease_chain_unclear",
      "二房东 / 转租链路不清",
      "当前房源疑似二房东或转租，必须核验授权和收款主体，否则退押和履约风险很高。",
      "high",
      "你真正签给谁、钱打给谁、谁有权出租，必须在签约前说清楚。"
    );
  } else if (landlordType === "unknown") {
    score -= 14;
    evidence.push("主体身份还没确认，先按高风险思路对待。");
    risk = buildDecisionRisk(
      "contract",
      "landlord_identity_unclear",
      "出租主体还没搞清",
      "当前还没明确是房东直租、中介还是二房东，签约风险无法判断。",
      "medium",
      "主体不明时，合同和收款账户都可能出问题。"
    );
  }

  if (contractVisibility === "refuses_to_share") {
    score -= 26;
    headline = "签约前不给看合同";
    summary = "不给提前看合同，本身就是强烈的风险信号。";
    nextStep = "没有合同样本就别推进，把时间留给更透明的房源。";
    risk = buildDecisionRisk(
      "contract",
      "contract_refused",
      "签约前不给看合同",
      "如果签约前连合同都不给看，后续被动接受条款的概率很高。",
      "high",
      "真正可信的出租方不会把最关键的约束留到最后一刻再给你。"
    );
  } else if (contractVisibility === "not_reviewed") {
    score -= 16;
    headline = "合同还没看到";
    summary = "目前还停留在口头承诺阶段，结论不能给得太满。";
    nextStep = "先把合同样本要来，至少确认主体、押付、违约和退租条款。";
    risk = buildDecisionRisk(
      "contract",
      "contract_unseen",
      "合同还没看到",
      "当前还没有看到正式合同，很多关键风险还停留在未知状态。",
      "medium",
      "真正会坑人的地方通常不写在房源文案里，而写在合同里。"
    );
  } else if (contractVisibility === "reviewed_with_risks") {
    score -= 18;
    headline = "合同里已经出现疑点";
    summary = "不是不能签，但至少有几条需要在付款前说清楚或改掉。";
    nextStep = "把违约、退押、维修责任和提前解约条款逐条拍照留证。";
    risk = buildDecisionRisk(
      "contract",
      "contract_terms_risky",
      "合同条款已有明显疑点",
      "当前合同里已经出现让你不舒服的条款，不能只靠口头承诺覆盖。",
      "high",
      "合同里最恶心的不是你看不懂，而是你看懂了却还抱着也许没事的侥幸。"
    );
  } else {
    evidence.push("合同至少已提前可见，条款透明度比纯口头承诺更高。");
  }

  if (depositMonths >= 2) {
    score -= 8;
    evidence.push("押金为 " + depositMonths + " 个月房租，退押压力会更大。");
  }

  if (paymentCycle === "quarterly" || paymentCycle === "half_yearly") {
    score -= paymentCycle === "half_yearly" ? 14 : 9;
    evidence.push("付款周期偏长，违约和退租成本都更重。");
  }

  if (agentFeeMonths >= 1 && landlordType !== "direct_landlord") {
    score -= 6;
    evidence.push("中介费约 " + agentFeeMonths + " 个月房租，收费口径要写进合同或收据。");
  }

  return {
    assessment: buildPillarAssessment("contract", score, headline, summary, evidence, nextStep),
    risk,
  };
}

function assessListingTrust(input: EvaluationInput): PillarDraft {
  const evidence: string[] = [];
  const listingMatchLevel = input.listingMatchLevel ?? "not_seen_yet";
  let score = 74;
  let headline = "页面和现场暂时对得上";
  let summary = "至少没有出现明显的信息失真。";
  let nextStep = "继续保留聊天记录和现场照片，后面合同核验时还有用。";
  let risk: RiskItem | undefined;

  switch (listingMatchLevel) {
    case "major_gaps":
      score -= 28;
      headline = "房源信息失真明显";
      summary = "照片、面积、朝向或房况和页面差得太多，信任基础已经动了。";
      nextStep = "优先保留证据并换下一套，不要继续在失真的房源上消耗。";
      evidence.push("现场和页面存在明显落差。");
      risk = buildDecisionRisk(
        "listing_trust",
        "listing_mismatch_major",
        "房源信息失真明显",
        "当前房源的页面信息与现场情况差距很大，继续推进的可信度很低。",
        "high",
        "如果页面都对不上，后面合同和履约也更难建立信任。"
      );
      break;
    case "minor_gaps":
      score -= 14;
      headline = "页面和现场有落差";
      summary = "不是完全作假，但细节已经说明这套房不能只信文案。";
      nextStep = "把不一致的地方继续追问清楚，再决定要不要推进。";
      evidence.push("现场和页面存在几处不一致，需要继续追问。");
      risk = buildDecisionRisk(
        "listing_trust",
        "listing_mismatch_minor",
        "页面和现场有落差",
        "房源展示与现场存在差异，后续需要把关键细节追问清楚。",
        "medium",
        "有落差不一定必死，但意味着这套房不能再享受默认可信的待遇。"
      );
      break;
    case "not_seen_yet":
      score -= 12;
      headline = "目前还停留在页面判断";
      summary = "现在的判断仍然建立在页面和聊天上，证据强度不够。";
      nextStep = "实地看房时优先拍照、测朝向、看墙角和卫生间，把证据补齐。";
      evidence.push("还没实地看房，当前只能按低完备信息处理。");
      risk = buildDecisionRisk(
        "listing_trust",
        "listing_unverified",
        "房源还没实地核验",
        "当前还没有现场证据，页面抓取和文案不能替代真实核验。",
        "medium",
        "抓取结果可以帮你排坑，但不能替你下最终结论。"
      );
      break;
    case "matches_listing":
    default:
      score += 6;
      evidence.push("现场、图片和关键描述基本一致。");
      break;
  }

  return {
    assessment: buildPillarAssessment("listing_trust", score, headline, summary, evidence, nextStep),
    risk,
  };
}

function isLowBoundaryGoal(goal: PrimaryGoal) {
  return goal === "couple" || goal === "sleep_quality";
}

function assessFlatshare(
  input: EvaluationInput,
  spaceScores?: Record<Dimension, number>
): PillarDraft {
  const evidence: string[] = [];

  if (!input.isShared) {
    return {
      assessment: buildPillarAssessment(
        "flatshare",
        86,
        "这套房没有明显室友变量",
        "如果是整租或独住，公共空间和室友边界风险天然更低。",
        ["当前不是合租场景，公共空间冲突不会成为主问题。"],
        "重点继续看合同、通勤和总成本。"
      ),
    };
  }

  let score = 70;
  const sharedSpaceRules = input.sharedSpaceRules ?? "some_uncertainty";
  let headline = "合租关系还需要继续摸清";
  let summary = "合租不是原罪，但公共空间和室友边界没讲清就会反复出问题。";
  let nextStep = "在签前把卫生、作息、访客、做饭和费用分摊都问清。";
  let risk: RiskItem | undefined;

  if (!input.roommateSituation) {
    score -= 12;
    evidence.push("合租场景下还没搞清室友关系。");
  } else if (input.roommateSituation === "strangers") {
    score -= 18;
    headline = "陌生人合租边界风险高";
    summary = "陌生人合租不一定不能住，但它会把隐私、作息和公共空间摩擦放大。";
    nextStep = "把公共空间规则和访客边界在签前说清，不清楚就别靠想象补。";
    evidence.push("当前是陌生人合租。");
    risk = buildDecisionRisk(
      "flatshare",
      "roommate_boundary_risk",
      "陌生人合租边界风险高",
      "当前房源属于陌生人合租，后续在作息、卫生和访客上更容易出问题。",
      isLowBoundaryGoal(input.primaryGoal) ? "high" : "medium",
      "合租最大的坑通常不是户型，而是边界和公共空间规则。"
    );
  } else if (input.roommateSituation === "friends" || input.roommateSituation === "couple") {
    score += 6;
    evidence.push("室友关系相对明确，沟通成本低于陌生人合租。");
  }

  if (sharedSpaceRules === "messy_or_unclear") {
    score -= 18;
    headline = "公共空间规则风险高";
    summary = "卫生、作息、访客和费用分摊都不清楚，住进去后最容易反复吵。";
    nextStep = "要么把规则说清拍下来，要么直接换房，不要指望住进去自然会顺。";
    evidence.push("公共空间规则当前比较乱或根本没讲清。");
    risk = buildDecisionRisk(
      "flatshare",
      "shared_space_conflict",
      "公共空间规则风险高",
      "当前公共空间规则混乱或不透明，入住后很容易反复扯皮。",
      "high",
      "公共空间问题最难靠后续补救，因为它每天都会发生。"
    );
  } else if (sharedSpaceRules === "some_uncertainty") {
    score -= 10;
    evidence.push("公共空间还有几项没讲透，后面需要继续确认。");
    if (!risk) {
      risk = buildDecisionRisk(
        "flatshare",
        "shared_rules_unclear",
        "合租规则还没讲透",
        "合租场景下还有几项关键规则没有确认，入住后容易转化成摩擦。",
        "medium",
        "作息、卫生和访客这些事，如果签前不聊，签后只会更难聊。"
      );
    }
  }

  if (spaceScores && spaceScores.privacy < 60) {
    score -= 8;
    evidence.push("空间隐私得分偏低，会放大合租中的边界问题。");
  }

  return {
    assessment: buildPillarAssessment("flatshare", score, headline, summary, evidence, nextStep),
    risk,
  };
}

function buildDecisionPillarDrafts(
  input: EvaluationInput,
  spaceScores?: Record<Dimension, number>
): PillarDraft[] {
  return [
    assessCashFlow(input),
    assessCommute(input),
    assessContract(input),
    assessListingTrust(input),
    assessFlatshare(input, spaceScores),
  ];
}

export function assessDecisionPillars(
  input: EvaluationInput,
  spaceScores?: Record<Dimension, number>
): DecisionPillarAssessment[] {
  return buildDecisionPillarDrafts(input, spaceScores).map((draft) => draft.assessment);
}

export function buildDecisionRisks(
  input: EvaluationInput,
  spaceScores?: Record<Dimension, number>
): RiskItem[] {
  return buildDecisionPillarDrafts(input, spaceScores)
    .map((draft) => draft.risk)
    .filter((risk): risk is RiskItem => Boolean(risk));
}

export function calculateDecisionScore(pillars: DecisionPillarAssessment[]) {
  const totalWeight = pillars.reduce((sum, pillar) => sum + pillarWeightMap[pillar.pillar], 0);

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(
    pillars.reduce((sum, pillar) => sum + pillar.score * pillarWeightMap[pillar.pillar], 0) /
      totalWeight
  );
}
