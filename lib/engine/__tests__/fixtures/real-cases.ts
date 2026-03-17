/**
 * 真实案例回放数据
 * 
 * 用于开发者人工验证系统判断是否合理
 * 每个案例包含：
 * - 真实房源描述（名称、标签）
 * - 完整输入数据
 * - 人工预期 verdict（开发者判断）
 * - 人工直觉问题点（开发者认为的主要问题）
 * - 备注（特殊观察点）
 */

import { EvaluationInput } from '../../types';

export interface RealCase {
  id: string;
  name: string;
  tags: string[];  // 场景标签，如["备考", "临街", "老破小"]
  description: string;  // 房源简述
  input: EvaluationInput;
  humanExpected: {
    verdict: 'rent' | 'cautious' | 'avoid';
    topIssues: string[];  // 人工直觉认为的主要问题
    reasoning: string;  // 人工判断理由
  };
  notes?: string;  // 备注
}

// 真实案例库
export const realCases: RealCase[] = [
  // 案例 1：典型临街老破小
  {
    id: "case_001_street_old",
    name: "朝阳区临街一居",
    tags: ["备考", "临街", "老破小", "东向"],
    description: "2000年老小区，临主干道，东向，4层/6层，42平开间",
    input: {
      layoutType: "studio",
      areaSqm: 42,
      orientation: "east",
      floorLevel: "middle",
      totalFloors: 6,
      hasElevator: false,
      buildingAge: "old",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: true,
      nearElevator: false,
      unitPosition: "middle",
      hasBalcony: false,
      kitchenType: "closed",
      bathroomPosition: "near_bedroom",
      bedPosition: "facing_door",
      deskPosition: "back_to_window",
      ventilation: "poor",
      dampSigns: [],
      isShared: false,
      primaryGoal: "exam_prep",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    humanExpected: {
      verdict: "avoid",
      topIssues: ["临街噪音大", "老破小隔音差", "通风不好", "书桌背窗反光"],
      reasoning: "临街主干道 + 老楼隔音差 = 噪音问题严重，备考需要安静，这套房基本不可行"
    },
    notes: "经典老破小问题组合，测试系统能否识别噪音+备考的致命冲突"
  },

  // 案例 2：优质南向一居
  {
    id: "case_002_south_good",
    name: "海淀区南向一居",
    tags: ["情侣", "南向", "次新", "中楼层"],
    description: "2018年小区，南向，8层/18层，55平一室一厅，不临街",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 55,
      orientation: "south",
      floorLevel: "middle",
      totalFloors: 18,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "corner",
      hasBalcony: true,
      kitchenType: "semi_open",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "cross_breeze",
      dampSigns: [],
      isShared: false,
      primaryGoal: "couple",
      monthlyBudget: "high",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    humanExpected: {
      verdict: "rent",
      topIssues: [],
      reasoning: "南向采光好，不临街安静，户型合理，情侣居住的优质选择"
    },
    notes: "优质房源标杆，测试系统能否给出 rent 结论且无高风险"
  },

  // 案例 3：西晒严重但可改善
  {
    id: "case_003_west_sun",
    name: "西晒严重两居",
    tags: ["睡眠优先", "西晒", "高楼层", "有电梯"],
    description: "2015年小区，西向，15层/18层，70平两居，下午西晒严重",
    input: {
      layoutType: "two_bedroom",
      areaSqm: 70,
      orientation: "west",
      floorLevel: "high",
      totalFloors: 18,
      hasElevator: true,
      buildingAge: "medium",
      hasWestFacingWindow: true,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "corner",
      hasBalcony: true,
      kitchenType: "open",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "sleep_quality",
      monthlyBudget: "high",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    humanExpected: {
      verdict: "cautious",
      topIssues: ["西晒严重", "卧室下午过热"],
      reasoning: "西晒确实影响睡眠，但可以通过遮光帘、隔热膜等低成本方式改善，预算充足的情况下值得考虑"
    },
    notes: "测试系统对'可改善风险'的判断，不应直接判 avoid"
  },

  // 案例 4：低楼层潮湿隐患
  {
    id: "case_004_ground_damp",
    name: "一楼带院老房",
    tags: ["老人居住", "一楼", "潮湿", "老房"],
    description: "1995年老小区，一楼，南北通透，60平两居，有院子但潮湿",
    input: {
      layoutType: "two_bedroom",
      areaSqm: 60,
      orientation: "south",
      floorLevel: "low",
      totalFloors: 6,
      hasElevator: false,
      buildingAge: "old",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "corner",
      hasBalcony: false,
      kitchenType: "closed",
      bathroomPosition: "near_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "cross_breeze",
      dampSigns: ["wall_damp"],
      isShared: false,
      primaryGoal: "elderly_safety",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    humanExpected: {
      verdict: "avoid",
      topIssues: ["一楼潮湿严重", "老人健康风险", "老小区设施老旧"],
      reasoning: "老人居住 + 一楼潮湿 = 健康隐患，墙面已有返潮，这是结构性问题难以根治"
    },
    notes: "测试系统对老人+潮湿这一高危组合的识别能力"
  },

  // 案例 5：居家办公无书桌空间
  {
    id: "case_005_wfh_no_desk",
    name: "开间居家办公",
    tags: ["居家办公", "开间", "无书桌", "新小区"],
    description: "2020年新小区，45平开间，空间紧凑，没有独立办公区",
    input: {
      layoutType: "studio",
      areaSqm: 45,
      orientation: "southeast",
      floorLevel: "middle",
      totalFloors: 20,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "partial",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "middle",
      hasBalcony: false,
      kitchenType: "open",
      bathroomPosition: "near_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "no_space",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "wfh",
      monthlyBudget: "medium",
      allowsLightRenovation: false,
      allowsFurnitureMove: false,
      allowsSoftImprovements: true,
    },
    humanExpected: {
      verdict: "avoid",
      topIssues: ["无独立办公空间", "不能移动家具改造", "工作生活无法分离"],
      reasoning: "居家办公需要独立工作区，但开间无此空间且用户不允许移动家具，无法解决"
    },
    notes: "测试系统对 wfh + no_desk_space + 不能移动家具这一组合的识别"
  },

  // 案例 6：合租隐私风险
  {
    id: "case_006_shared_privacy",
    name: "合租主卧隐私差",
    tags: ["合租", "隐私", "中间户", "备考"],
    description: "2010年小区，三户合租，主卧朝南但门对床，中间户隔音一般",
    input: {
      layoutType: "three_bedroom",
      areaSqm: 18,
      orientation: "south",
      floorLevel: "middle",
      totalFloors: 15,
      hasElevator: true,
      buildingAge: "medium",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "middle",
      hasBalcony: false,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "facing_door",
      deskPosition: "facing_wall",
      ventilation: "good",
      dampSigns: [],
      isShared: true,
      primaryGoal: "exam_prep",
      monthlyBudget: "low",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    humanExpected: {
      verdict: "cautious",
      topIssues: ["合租隐私差", "门对床", "中间户隔音一般"],
      reasoning: "合租+门对床影响隐私和安全感，但可以通过隔断帘等低成本方式改善，预算有限的情况下可考虑"
    },
    notes: "测试系统对合租隐私风险的判断和推荐改善动作"
  }
];

// 快速查找案例
export function getRealCase(id: string): RealCase | undefined {
  return realCases.find(c => c.id === id);
}

// 按标签筛选案例
export function filterCasesByTag(tag: string): RealCase[] {
  return realCases.filter(c => c.tags.includes(tag));
}

// 按 verdict 筛选案例
export function filterCasesByVerdict(verdict: RealCase['humanExpected']['verdict']): RealCase[] {
  return realCases.filter(c => c.humanExpected.verdict === verdict);
}
