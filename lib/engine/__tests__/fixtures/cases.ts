// 8组测试样例 - 验证决策链完整性
// 每组验证：verdict、总分区间、风险存在性、维度相对关系

import { EvaluationInput } from '../../types';

export interface TestCase {
  id: string;
  name: string;
  input: EvaluationInput;
  expectations: {
    verdict: 'rent' | 'cautious' | 'avoid';
    scoreRange: [number, number];  // 总分区间 [min, max]
    mustHaveRisks?: string[];  // 必须存在的风险code（不强制排序）
    mustNotHaveRisks?: string[];  // 必须不存在的风险code
    lowestDimensions?: string[];  // 分数最低的几个维度（不强制排序）
    actionCandidates?: string[];  // 第一动作的候选code（允许其中之一）
  };
}

// 基础默认值
const baseInput: Partial<EvaluationInput> = {
  areaSqm: 50,
  totalFloors: 18,
  hasElevator: true,
  hasWestFacingWindow: false,
  windowExposure: 'full',
  facesMainRoad: false,
  nearElevator: false,
  unitPosition: 'middle',
  hasBalcony: true,
  bathroomPosition: 'far_from_bedroom',
  bedPosition: 'away_from_door',
  deskPosition: 'facing_window',
  dampSigns: [],
  isShared: false,
  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
};

export const testCases: TestCase[] = [
  // ===== 场景1：良好房源（南向+新楼+备考党）=====
  {
    id: 'case_01_perfect_exam',
    name: '良好房源-备考党',
    input: {
      ...baseInput,
      layoutType: 'one_bedroom',
      orientation: 'south',
      floorLevel: 'middle',
      buildingAge: 'new',
      kitchenType: 'closed',
      ventilation: 'cross_breeze',
      primaryGoal: 'exam_prep',
      monthlyBudget: 'medium',
    } as EvaluationInput,
    expectations: {
      verdict: 'cautious',
      scoreRange: [55, 85],
      mustNotHaveRisks: ['damp_signs', 'street_noise_low', 'street_noise_high'],
    },
  },

  // ===== 场景2：临街+西晒+睡眠优先（双重睡眠杀手）=====
  {
    id: 'case_02_street_west_sleep',
    name: '临街+西晒+睡眠优先（致命组合）',
    input: {
      ...baseInput,
      layoutType: 'studio',
      orientation: 'west',
      floorLevel: 'low',
      buildingAge: 'medium',
      hasWestFacingWindow: true,
      facesMainRoad: true,
      kitchenType: 'open',
      ventilation: 'good',
      primaryGoal: 'sleep_quality',
      monthlyBudget: 'low',
    } as EvaluationInput,
    expectations: {
      verdict: 'avoid',
      scoreRange: [30, 65],
      mustHaveRisks: ['street_noise_low', 'west_sun_bedroom'],
      lowestDimensions: ['focus', 'noise'],
      actionCandidates: ['blackout_curtain', 'seal_strip'],
    },
  },

  // ===== 场景3：北向+老破小+通风差 =====
  {
    id: 'case_03_old_poor_ventilation',
    name: '北向老破小+通风差',
    input: {
      ...baseInput,
      layoutType: 'studio',
      orientation: 'north',
      floorLevel: 'low',
      buildingAge: 'old',
      kitchenType: 'closed',
      ventilation: 'poor',
      primaryGoal: 'exam_prep',
      monthlyBudget: 'low',
    } as EvaluationInput,
    expectations: {
      verdict: 'cautious',
      scoreRange: [45, 70],
      mustHaveRisks: ['poor_ventilation', 'old_building_noise'],
      lowestDimensions: ['dampness', 'circulation'],
      actionCandidates: ['dehumidifier', 'ventilation_fan'],
    },
  },

  // ===== 场景4：合租+书桌背门+隐私风险 =====
  // 规则修正：情侣与陌生人合租是隐私硬伤，应判 avoid
  {
    id: 'case_04_shared_privacy',
    name: '合租+隐私风险',
    input: {
      ...baseInput,
      layoutType: 'two_bedroom',
      orientation: 'southeast',
      floorLevel: 'middle',
      buildingAge: 'medium',
      deskPosition: 'back_to_window',
      bedPosition: 'facing_door',
      isShared: true,
      ventilation: 'good',
      primaryGoal: 'couple',
      monthlyBudget: 'medium',
    } as EvaluationInput,
    expectations: {
      verdict: 'avoid',
      scoreRange: [50, 75],
      mustHaveRisks: ['bed_privacy', 'shared_privacy'],
      lowestDimensions: ['privacy'],
      actionCandidates: ['room_divider', 'curtain_door'],
    },
  },

  // ===== 场景5：低楼层+潮湿迹象+老人（高危组合）=====
  {
    id: 'case_05_elderly_damp',
    name: '老人居住+低楼层+潮湿（致命）',
    input: {
      ...baseInput,
      layoutType: 'one_bedroom',
      orientation: 'south',
      floorLevel: 'low',
      buildingAge: 'old',
      dampSigns: ['wall_damp', 'mold_smell'],
      kitchenType: 'closed',
      ventilation: 'poor',
      primaryGoal: 'elderly_safety',
      monthlyBudget: 'medium',
    } as EvaluationInput,
    expectations: {
      verdict: 'avoid',
      scoreRange: [20, 55],
      mustHaveRisks: ['damp_signs', 'poor_ventilation'],
      lowestDimensions: ['dampness', 'circulation'],
    },
  },

  // ===== 场景6：电梯旁+开间+居家办公 =====
  {
    id: 'case_06_elevator_wfh',
    name: '电梯旁+开间办公',
    input: {
      ...baseInput,
      layoutType: 'studio',
      orientation: 'east',
      floorLevel: 'high',
      buildingAge: 'new',
      nearElevator: true,
      kitchenType: 'open',
      ventilation: 'good',
      primaryGoal: 'wfh',
      monthlyBudget: 'high',
    } as EvaluationInput,
    expectations: {
      verdict: 'cautious',
      scoreRange: [55, 80],
      mustHaveRisks: ['elevator_noise'],
      lowestDimensions: ['noise', 'focus'],
      actionCandidates: ['white_noise', 'seal_strip'],
    },
  },

  // ===== 场景7：全封闭厨房+无窗+情侣 =====
  {
    id: 'case_07_closed_kitchen_couple',
    name: '封闭厨房+通风差+情侣',
    input: {
      ...baseInput,
      layoutType: 'one_bedroom',
      orientation: 'southwest',
      floorLevel: 'middle',
      buildingAge: 'medium',
      kitchenType: 'closed',
      ventilation: 'none',
      primaryGoal: 'couple',
      monthlyBudget: 'medium',
    } as EvaluationInput,
    expectations: {
      verdict: 'cautious',
      scoreRange: [50, 75],
      mustHaveRisks: ['poor_ventilation'],
      lowestDimensions: ['dampness'],
    },
  },

  // ===== 场景8：较好房源（南向+中楼层+情侣）=====
  {
    id: 'case_08_perfect_couple',
    name: '较好房源-情侣',
    input: {
      ...baseInput,
      layoutType: 'two_bedroom',
      orientation: 'south',
      floorLevel: 'middle',
      buildingAge: 'new',
      kitchenType: 'semi_open',
      ventilation: 'cross_breeze',
      bedPosition: 'away_from_door',
      primaryGoal: 'couple',
      monthlyBudget: 'high',
    } as EvaluationInput,
    expectations: {
      verdict: 'cautious',
      scoreRange: [55, 85],
      mustNotHaveRisks: ['street_noise_low', 'street_noise_high', 'damp_signs'],
    },
  },
];

export function getTestCase(id: string): TestCase | undefined {
  return testCases.find(c => c.id === id);
}
