import type {
  ArrivalWindow,
  CurrentHousingStatus,
  HukouInterest,
  OfferStatus,
  RouteStageKey,
} from "../types/survival-sandbox";

export const routeStageMeta: Record<
  RouteStageKey,
  { label: string; description: string; order: number }
> = {
  before_offer: {
    label: "签约前",
    description: "先把单位资格、合同边界和落户口径问清，再决定要不要把自己锁进去。",
    order: 1,
  },
  after_offer: {
    label: "拿到 Offer 后",
    description: "把书面材料、HR 口径和申报窗口对齐，避免后面边走边补。",
    order: 2,
  },
  before_arrival: {
    label: "到沪前",
    description: "把档案、住处证明和第一周要跑的事项先排好，不把麻烦留到落地后。",
    order: 3,
  },
  first_week_in_shanghai: {
    label: "到沪第一周",
    description: "优先把住址、证明链和必须留痕的事项补齐。",
    order: 4,
  },
  housing: {
    label: "租房落脚",
    description: "不是先抢房，而是先确认谁能配合你留下合法证明和退租路径。",
    order: 5,
  },
  onboarding: {
    label: "入职手续",
    description: "把劳动关系写实、写清、写到手里，而不是只听口头承诺。",
    order: 6,
  },
  social_insurance: {
    label: "社保公积金",
    description: "把“公司会办”变成“我核实过已经办完”。",
    order: 7,
  },
  hukou_watchouts: {
    label: "落户风险位",
    description: "把年度政策、材料真实性和失效条件单独盯住，不拿模糊承诺冒险。",
    order: 8,
  },
};

export const offerStatusOptions: Array<{
  value: OfferStatus;
  label: string;
  description: string;
}> = [
  { value: "no_offer", label: "还在看机会", description: "优先锁定签约边界和单位口径。" },
  { value: "verbal_offer", label: "口头确定了", description: "重点把口头承诺变成书面依据。" },
  { value: "signed_offer", label: "已经拿到正式 offer", description: "可以开始排到沪与入职动作。" },
  { value: "already_onboarded", label: "已经入职", description: "优先补核对社保、公积金和证据链。" },
];

export const arrivalWindowOptions: Array<{
  value: ArrivalWindow;
  label: string;
  description: string;
}> = [
  { value: "within_2_weeks", label: "两周内到上海", description: "路线图会把第一周动作前置。" },
  { value: "this_month", label: "本月内", description: "适合先排签约、档案和住处证明。" },
  { value: "next_1_3_months", label: "1-3 个月内", description: "可以先做准备，不急着马上跑窗口。" },
  { value: "not_sure", label: "时间还不确定", description: "优先锁定最容易错过的时效事项。" },
];

export const hukouInterestOptions: Array<{
  value: HukouInterest;
  label: string;
  description: string;
}> = [
  { value: "strong_yes", label: "会认真争取", description: "路线图会强化落户资格与材料提醒。" },
  { value: "maybe", label: "先保留可能性", description: "先留入口，不先被协议卡死。" },
  { value: "not_now", label: "暂时不考虑", description: "只保留关键时效提醒，不强推申报。" },
];

export const housingStatusOptions: Array<{
  value: CurrentHousingStatus;
  label: string;
  description: string;
}> = [
  { value: "campus", label: "还在学校", description: "重点准备落地后第一住处和转档节奏。" },
  { value: "with_family", label: "目前住家里", description: "优先把异地搬迁前要留痕的材料准备好。" },
  { value: "company_housing", label: "公司可能提供宿舍", description: "重点确认宿舍证明能否用于后续办理。" },
  { value: "short_term_stay", label: "先短租/酒店过渡", description: "优先安排可留下合法居住证明的第二住处。" },
  { value: "already_renting", label: "已经找好房了", description: "重点确认备案、证明链和退租路径。" },
];

export const offerStatusLabels = Object.fromEntries(
  offerStatusOptions.map((item) => [item.value, item.label])
) as Record<OfferStatus, string>;

export const arrivalWindowLabels = Object.fromEntries(
  arrivalWindowOptions.map((item) => [item.value, item.label])
) as Record<ArrivalWindow, string>;

export const hukouInterestLabels = Object.fromEntries(
  hukouInterestOptions.map((item) => [item.value, item.label])
) as Record<HukouInterest, string>;

export const housingStatusLabels = Object.fromEntries(
  housingStatusOptions.map((item) => [item.value, item.label])
) as Record<CurrentHousingStatus, string>;
