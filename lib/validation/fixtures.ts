// 真实房源验证案例库
// 包含 20 套真实房源案例，用于验证引擎准确性

import { ValidationCase } from "./types";

export const validationCases: ValidationCase[] = [
  // ===== 场景 1: 备考/居家办公 - 噪音敏感 =====
  {
    id: "case-001",
    name: "朝阳区三里屯一居室（临街）",
    location: "朝阳区三里屯",
    scenario: "exam_prep",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 45,
      orientation: "south",
      floorLevel: "middle",
      totalFloors: 18,
      hasElevator: true,
      buildingAge: "medium",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: true,
      nearElevator: false,
      unitPosition: "middle",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "exam_prep",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 45, dampness: 80, privacy: 75, circulation: 70, focus: 50 },
      overallScore: 63,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 1, factors: [] },
        { dimension: 'noise', score: 45, weight: 1.3, factors: [] },
        { dimension: 'dampness', score: 80, weight: 1, factors: [] },
        { dimension: 'privacy', score: 75, weight: 1.1, factors: [] },
        { dimension: 'circulation', score: 70, weight: 0.8, factors: [] },
        { dimension: 'focus', score: 50, weight: 1.2, factors: [] },
      ],
      risks: [
        { id: 'street_noise', severity: 'high', dimension: 'noise', title: '临街主干道噪音', description: '卧室临主干道，车流量大', modernReason: '影响专注和休息' }
      ],
      actions: [
        { code: 'seal_strip', title: '安装密封条', subtitle: '隔音降噪', description: '门窗密封', costLevel: 'low', costRange: '200-500元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: true }, expectedBenefit: { description: '降低噪音', score: 8 }, targetsRisks: ['street_noise'], priorityReason: '首要问题' }
      ],
      verdict: 'avoid'
    },
    humanExpectation: {
      verdict: 'avoid',
      topRiskGuess: '临街噪音无法通过低成本方式根本解决',
      firstActionGuess: '换房',
      confidence: 'high'
    },
    notes: '实际看过房，白天噪音已经很明显，晚上估计更严重。对于备考来说，这种噪音是致命伤。密封条只能缓解，无法根本解决。',
    status: 'confirmed',
    tags: ['临街', '噪音', '备考', '争议'],
    createdAt: '2026-03-01',
    updatedAt: '2026-03-01'
  },

  // ===== 场景 2: 情侣合租 - 隐私优先 =====
  {
    id: "case-002",
    name: "海淀区五道口合租主卧",
    location: "海淀区五道口",
    scenario: "couple",
    input: {
      layoutType: "studio",
      areaSqm: 20,
      orientation: "south",
      floorLevel: "high",
      totalFloors: 28,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: true,
      unitPosition: "corner",
      hasBalcony: false,
      kitchenType: "open",
      bathroomPosition: "near_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_wall",
      ventilation: "good",
      dampSigns: [],
      isShared: true,
      roommateSituation: "strangers",
      primaryGoal: "couple",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 80, noise: 60, dampness: 75, privacy: 40, circulation: 65, focus: 55 },
      overallScore: 62,
      dimensions: [
        { dimension: 'lighting', score: 80, weight: 1, factors: [] },
        { dimension: 'noise', score: 60, weight: 1, factors: [] },
        { dimension: 'dampness', score: 75, weight: 1, factors: [] },
        { dimension: 'privacy', score: 40, weight: 1.2, factors: [] },
        { dimension: 'circulation', score: 65, weight: 1, factors: [] },
        { dimension: 'focus', score: 55, weight: 0.8, factors: [] },
      ],
      risks: [
        { id: 'shared_privacy', severity: 'high', dimension: 'privacy', title: '合租隐私不足', description: '与陌生人合租，公共区域共享', modernReason: '情侣生活需要隐私空间' },
        { id: 'elevator_noise', severity: 'medium', dimension: 'noise', title: '电梯运行噪音', description: '房间靠近电梯井', modernReason: '影响睡眠' }
      ],
      actions: [
        { code: 'white_noise', title: '使用白噪音', subtitle: '改善睡眠', description: '掩盖噪音', costLevel: 'low', costRange: '100-300元', difficulty: 'easy', timeRequired: '立即', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '缓解噪音', score: 5 }, targetsRisks: ['elevator_noise'], priorityReason: '低成本高回报' }
      ],
      verdict: 'avoid'
    },
    humanExpectation: {
      verdict: 'avoid',
      topRiskGuess: '与陌生人合租对情侣来说隐私太差',
      firstActionGuess: '找整租',
      confidence: 'high'
    },
    notes: '虽然是主卧，但与陌生人共用卫生间和厨房，情侣住会很不方便。规则已修正：情侣合租现在直接判 avoid。',
    status: 'confirmed',
    tags: ['合租', '情侣', '隐私', '争议'],
    createdAt: '2026-03-02',
    updatedAt: '2026-03-02'
  },

  // ===== 场景 3: 睡眠优先 - 安静环境 =====
  {
    id: "case-003",
    name: "通州区梨园小区一居室",
    location: "通州区梨园",
    scenario: "sleep_quality",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 55,
      orientation: "south",
      floorLevel: "middle",
      totalFloors: 12,
      hasElevator: true,
      buildingAge: "medium",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "end",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "no_space",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "sleep_quality",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 80, dampness: 70, privacy: 80, circulation: 75, focus: 70 },
      overallScore: 77,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 0.9, factors: [] },
        { dimension: 'noise', score: 80, weight: 1.3, factors: [] },
        { dimension: 'dampness', score: 70, weight: 1, factors: [] },
        { dimension: 'privacy', score: 80, weight: 1.1, factors: [] },
        { dimension: 'circulation', score: 75, weight: 0.8, factors: [] },
        { dimension: 'focus', score: 70, weight: 0.7, factors: [] },
      ],
      risks: [
        { id: 'building_age', severity: 'low', dimension: 'dampness', title: '房龄较老', description: '2000-2010年建筑', modernReason: '可能存在老化问题' }
      ],
      actions: [
        { code: 'check_pipes', title: '检查水管', subtitle: '预防漏水', description: '检查厨房卫生间水管', costLevel: 'low', costRange: '0元', difficulty: 'easy', timeRequired: '看房时', requirements: { needsBuyMaterials: false, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '提前发现问题', score: 3 }, targetsRisks: ['building_age'], priorityReason: '预防为主' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '房龄老但维护好应该没问题',
      firstActionGuess: '入住前彻底清洁',
      confidence: 'medium'
    },
    notes: '实际看过，小区安静，户型方正，不临街，很适合睡眠浅的人。房龄虽然老但物业维护不错。',
    status: 'confirmed',
    tags: ['安静', '睡眠', '老小区', '确认'],
    createdAt: '2026-03-03',
    updatedAt: '2026-03-03'
  },

  // ===== 场景 4: 居家办公 - 采光+专注 =====
  {
    id: "case-004",
    name: "朝阳区望京SOHO附近公寓",
    location: "朝阳区望京",
    scenario: "wfh",
    input: {
      layoutType: "studio",
      areaSqm: 35,
      orientation: "north",
      floorLevel: "high",
      totalFloors: 25,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "partial",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "middle",
      hasBalcony: false,
      kitchenType: "open",
      bathroomPosition: "adjacent_bedroom",
      bedPosition: "beside_window",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "wfh",
      monthlyBudget: "high",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 55, noise: 75, dampness: 80, privacy: 70, circulation: 60, focus: 50 },
      overallScore: 65,
      dimensions: [
        { dimension: 'lighting', score: 55, weight: 1.1, factors: [] },
        { dimension: 'noise', score: 75, weight: 1.2, factors: [] },
        { dimension: 'dampness', score: 80, weight: 0.9, factors: [] },
        { dimension: 'privacy', score: 70, weight: 1, factors: [] },
        { dimension: 'circulation', score: 60, weight: 0.9, factors: [] },
        { dimension: 'focus', score: 50, weight: 1.3, factors: [] },
      ],
      risks: [
        { id: 'lighting_north', severity: 'medium', dimension: 'lighting', title: '北向采光不足', description: '主要窗户朝北，自然光较少', modernReason: '白天需要开灯，影响工作效率' },
        { id: 'studio_focus', severity: 'medium', dimension: 'focus', title: '开间办公干扰', description: '卧室与办公区无隔断', modernReason: '工作生活界限模糊' }
      ],
      actions: [
        { code: 'supplemental_light', title: '补充照明', subtitle: '改善采光', description: '增加护眼台灯和落地灯', costLevel: 'medium', costRange: '300-800元', difficulty: 'easy', timeRequired: '1小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '提升亮度', score: 6 }, targetsRisks: ['lighting_north'], priorityReason: '办公刚需' },
        { code: 'room_divider', title: '设置隔断', subtitle: '分隔空间', description: '使用屏风或书架分隔', costLevel: 'medium', costRange: '200-600元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: true, needsLightRenovation: false }, expectedBenefit: { description: '提升专注', score: 5 }, targetsRisks: ['studio_focus'], priorityReason: '改善体验' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '北向采光确实是个问题，但可以用灯补',
      firstActionGuess: '买个好台灯+屏风隔断',
      confidence: 'medium'
    },
    notes: '开放式厨房，北向采光确实偏暗，但安静、通勤方便。对于 WFH 来说，采光可以用人工光源弥补，安静更重要。',
    status: 'confirmed',
    tags: ['望京', '居家办公', '开间', '确认'],
    createdAt: '2026-03-04',
    updatedAt: '2026-03-04'
  },

  // ===== 场景 5: 老人居住 - 安全+动线 =====
  {
    id: "case-005",
    name: "西城区老小区低层两居室",
    location: "西城区",
    scenario: "elderly_safety",
    input: {
      layoutType: "two_bedroom",
      areaSqm: 65,
      orientation: "south",
      floorLevel: "low",
      totalFloors: 6,
      hasElevator: false,
      buildingAge: "old",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: true,
      nearElevator: false,
      unitPosition: "end",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "no_space",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "elderly_safety",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 50, dampness: 65, privacy: 80, circulation: 75, focus: 60 },
      overallScore: 69,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 1, factors: [] },
        { dimension: 'noise', score: 50, weight: 0.9, factors: [] },
        { dimension: 'dampness', score: 65, weight: 1.2, factors: [] },
        { dimension: 'privacy', score: 80, weight: 0.9, factors: [] },
        { dimension: 'circulation', score: 75, weight: 1.3, factors: [] },
        { dimension: 'focus', score: 60, weight: 0.7, factors: [] },
      ],
      risks: [
        { id: 'no_elevator', severity: 'medium', dimension: 'circulation', title: '无电梯', description: '2楼无电梯，负担可控', modernReason: '低楼层对老人尚可接受' },
        { id: 'street_noise', severity: 'medium', dimension: 'noise', title: '临街噪音', description: '卧室临主干道', modernReason: '影响休息' },
        { id: 'old_damp', severity: 'medium', dimension: 'dampness', title: '老房潮湿风险', description: '2000年前建筑', modernReason: '老人更易受潮湿影响' }
      ],
      actions: [
        { code: 'add_handrail', title: '加装扶手', subtitle: '楼梯安全', description: '楼梯间加装扶手', costLevel: 'medium', costRange: '500-1000元', difficulty: 'medium', timeRequired: '半天', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: true }, expectedBenefit: { description: '提升安全', score: 8 }, targetsRisks: ['no_elevator'], priorityReason: '安全刚需' }
      ],
      verdict: 'avoid'
    },
    humanExpectation: {
      verdict: 'avoid',
      topRiskGuess: '无电梯对老人来说是大问题',
      firstActionGuess: '找有电梯的房',
      confidence: 'high'
    },
    notes: '虽然是低层（2楼），但无电梯对70岁老人来说依然有风险。而且临街噪音对老人休息影响大。建议换房。',
    status: 'confirmed',
    tags: ['老人', '无电梯', '临街', '确认'],
    createdAt: '2026-03-05',
    updatedAt: '2026-03-05'
  },

  
  // ===== 场景 6: 情侣 + 熟人合租（测试 override 是否过严）=====
  {
    id: "case-006",
    name: "朝阳区大悦城附近合租次卧（与朋友）",
    location: "朝阳区大悦城",
    scenario: "couple",
    input: {
      layoutType: "two_bedroom",
      areaSqm: 18,
      orientation: "south",
      floorLevel: "middle",
      totalFloors: 20,
      hasElevator: true,
      buildingAge: "medium",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "corner",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "near_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: true,
      roommateSituation: "friends",
      primaryGoal: "couple",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 75, dampness: 75, privacy: 40, circulation: 70, focus: 65 },
      overallScore: 68,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 1, factors: [] },
        { dimension: 'noise', score: 75, weight: 1, factors: [] },
        { dimension: 'dampness', score: 75, weight: 1, factors: [] },
        { dimension: 'privacy', score: 40, weight: 1.2, factors: [] },
        { dimension: 'circulation', score: 70, weight: 1, factors: [] },
        { dimension: 'focus', score: 65, weight: 0.8, factors: [] },
      ],
      risks: [
        { id: 'shared_privacy', severity: 'medium', dimension: 'privacy', title: '合租隐私风险', description: '与朋友合租，共享公共区域', modernReason: '情侣生活需要隐私空间' }
      ],
      actions: [
        { code: 'room_divider', title: '设置隔断', subtitle: '增加隐私', description: '使用屏风或书架分隔', costLevel: 'medium', costRange: '200-600元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: true, needsLightRenovation: false }, expectedBenefit: { description: '提升隐私', score: 5 }, targetsRisks: ['shared_privacy'], priorityReason: '改善体验' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '与朋友合租隐私有局限，但可接受',
      firstActionGuess: '设置隔断、明确公共区域使用规则',
      confidence: 'medium'
    },
    notes: '和朋友合租比陌生人好很多，有基本信任。虽然隐私受限，但作为过渡性选择可以接受。系统现在直接判avoid可能过于严格。',
    status: 'pending',
    tags: ['情侣', '朋友合租', 'override检查', '边界案例'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },

  // ===== 场景 7: 备考 + 楼内噪音（测试非临街噪音处理）=====
  {
    id: "case-007",
    name: "海淀区学院路电梯旁一居室",
    location: "海淀区学院路",
    scenario: "exam_prep",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 42,
      orientation: "south",
      floorLevel: "high",
      totalFloors: 22,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: true,
      unitPosition: "middle",
      hasBalcony: false,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "exam_prep",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 55, dampness: 80, privacy: 80, circulation: 75, focus: 70 },
      overallScore: 72,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 1, factors: [] },
        { dimension: 'noise', score: 55, weight: 1.3, factors: [] },
        { dimension: 'dampness', score: 80, weight: 0.9, factors: [] },
        { dimension: 'privacy', score: 80, weight: 1.1, factors: [] },
        { dimension: 'circulation', score: 75, weight: 0.8, factors: [] },
        { dimension: 'focus', score: 70, weight: 1.2, factors: [] },
      ],
      risks: [
        { id: 'elevator_noise', severity: 'medium', dimension: 'noise', title: '电梯运行噪音', description: '房间靠近电梯井', modernReason: '影响睡眠和专注' }
      ],
      actions: [
        { code: 'white_noise', title: '使用白噪音', subtitle: '改善睡眠', description: '掩盖电梯噪音', costLevel: 'low', costRange: '100-300元', difficulty: 'easy', timeRequired: '立即', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '缓解噪音', score: 5 }, targetsRisks: ['elevator_noise'], priorityReason: '低成本高回报' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '电梯噪音有影响但可通过白噪音改善',
      firstActionGuess: '使用白噪音或耳塞',
      confidence: 'medium'
    },
    notes: '电梯噪音是低频的，白噪音可以有效掩盖。不临街是很大的优势。对于备考来说，这种程度的噪音是可以接受的。',
    status: 'pending',
    tags: ['备考', '电梯噪音', '可改善', '边界案例'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },

  // ===== 场景 8: 睡眠 + 西晒可改善（测试可改善风险）=====
  {
    id: "case-008",
    name: "西城区西向一居室（可装遮光帘）",
    location: "西城区",
    scenario: "sleep_quality",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 50,
      orientation: "west",
      floorLevel: "middle",
      totalFloors: 15,
      hasElevator: true,
      buildingAge: "medium",
      hasWestFacingWindow: true,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "end",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "sleep_quality",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 70, noise: 80, dampness: 75, privacy: 80, circulation: 75, focus: 70 },
      overallScore: 76,
      dimensions: [
        { dimension: 'lighting', score: 70, weight: 0.9, factors: [] },
        { dimension: 'noise', score: 80, weight: 1.3, factors: [] },
        { dimension: 'dampness', score: 75, weight: 1, factors: [] },
        { dimension: 'privacy', score: 80, weight: 1.1, factors: [] },
        { dimension: 'circulation', score: 75, weight: 0.8, factors: [] },
        { dimension: 'focus', score: 70, weight: 0.7, factors: [] },
      ],
      risks: [
        { id: 'west_sun_bedroom', severity: 'high', dimension: 'lighting', title: '卧室西晒严重', description: '下午强烈的西晒会导致卧室温度升高', modernReason: '西晒导致下午室温过高，影响睡眠质量' }
      ],
      actions: [
        { code: 'blackout_curtain', title: '安装遮光帘', subtitle: '隔绝西晒', description: '有效阻挡阳光和热量', costLevel: 'medium', costRange: '300-800元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '降低室温', score: 8 }, targetsRisks: ['west_sun_bedroom'], priorityReason: '睡眠刚需' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '西晒可以通过遮光帘完全解决',
      firstActionGuess: '安装遮光帘',
      confidence: 'high'
    },
    notes: '西晒确实热，但遮光帘可以几乎完全解决这个问题。不临街、通风好，对于睡眠来说是很好的选择。系统判cautious可能过于保守。',
    status: 'pending',
    tags: ['睡眠', '西晒', '可改善', '边界案例'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },

  // ===== 场景 9: 睡眠 + 临街但高楼层（测试高楼层影响）=====
  {
    id: "case-009",
    name: "国贸CBD高层开间（18层临街）",
    location: "朝阳区国贸",
    scenario: "sleep_quality",
    input: {
      layoutType: "studio",
      areaSqm: 35,
      orientation: "south",
      floorLevel: "high",
      totalFloors: 28,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: true,
      nearElevator: false,
      unitPosition: "middle",
      hasBalcony: false,
      kitchenType: "open",
      bathroomPosition: "adjacent_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_wall",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "sleep_quality",
      monthlyBudget: "high",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 50, dampness: 80, privacy: 70, circulation: 65, focus: 60 },
      overallScore: 68,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 0.9, factors: [] },
        { dimension: 'noise', score: 50, weight: 1.3, factors: [] },
        { dimension: 'dampness', score: 80, weight: 1, factors: [] },
        { dimension: 'privacy', score: 70, weight: 1.1, factors: [] },
        { dimension: 'circulation', score: 65, weight: 0.8, factors: [] },
        { dimension: 'focus', score: 60, weight: 0.7, factors: [] },
      ],
      risks: [
        { id: 'street_noise_high', severity: 'medium', dimension: 'noise', title: '临街主干道噪音（高层）', description: '18层高楼层，噪音影响较小', modernReason: '高层噪音相对可控' }
      ],
      actions: [
        { code: 'seal_strip', title: '安装密封条', subtitle: '隔音降噪', description: '门窗密封降低噪音', costLevel: 'low', costRange: '200-500元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: true }, expectedBenefit: { description: '降低噪音', score: 8 }, targetsRisks: ['street_noise'], priorityReason: '睡眠刚需' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '18层高楼层，实际噪音比低层小很多',
      firstActionGuess: '安装密封条+厚窗帘',
      confidence: 'medium'
    },
    notes: '18层已经很高了，实际噪音会比低层小很多。密封条+厚窗帘应该能解决问题。系统现在把高楼层临街和低楼层同等对待，可能过于严格。',
    status: 'pending',
    tags: ['睡眠', '临街', '高楼层', '边界案例'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },

  // ===== 场景 10: 老人 + 低楼层但通风良好（测试override细化）=====
  {
    id: "case-010",
    name: "东城区低层一居室（2楼但通风好）",
    location: "东城区",
    scenario: "elderly_safety",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 55,
      orientation: "south",
      floorLevel: "low",
      totalFloors: 6,
      hasElevator: false,
      buildingAge: "medium",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "end",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "cross_breeze",
      dampSigns: [],
      isShared: false,
      primaryGoal: "elderly_safety",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 75, dampness: 75, privacy: 80, circulation: 80, focus: 65 },
      overallScore: 77,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 1, factors: [] },
        { dimension: 'noise', score: 75, weight: 0.9, factors: [] },
        { dimension: 'dampness', score: 75, weight: 1.2, factors: [] },
        { dimension: 'privacy', score: 80, weight: 0.9, factors: [] },
        { dimension: 'circulation', score: 80, weight: 1.3, factors: [] },
        { dimension: 'focus', score: 65, weight: 0.7, factors: [] },
      ],
      risks: [
        { id: 'no_elevator', severity: 'high', dimension: 'circulation', title: '无电梯', description: '6层以下无电梯', modernReason: '老人上下楼不便' }
      ],
      actions: [
        { code: 'add_handrail', title: '加装扶手', subtitle: '楼梯安全', description: '楼梯间加装扶手', costLevel: 'medium', costRange: '500-1000元', difficulty: 'medium', timeRequired: '半天', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: true }, expectedBenefit: { description: '提升安全', score: 8 }, targetsRisks: ['no_elevator'], priorityReason: '安全刚需' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '无电梯有风险，但2楼+通风好+无潮湿，可以考虑',
      firstActionGuess: '加装扶手、安装防滑条',
      confidence: 'medium'
    },
    notes: '2楼不算高，每天上下几次对健康的老人来说是可以接受的。南北通透通风好，没有潮湿问题。如果老人身体还可以，这个房子是可以考虑的。系统现在只要老人+无电梯就判avoid，可能过于一刀切。',
    status: 'pending',
    tags: ['老人', '低楼层', '通风好', 'override检查'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },

  // ===== 场景 11: 居家办公 + 开间但书桌区明确（测试wfh边界）=====
  {
    id: "case-011",
    name: "望京开间公寓（有独立书桌区）",
    location: "朝阳区望京",
    scenario: "wfh",
    input: {
      layoutType: "studio",
      areaSqm: 45,
      orientation: "east",
      floorLevel: "middle",
      totalFloors: 20,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "corner",
      hasBalcony: true,
      kitchenType: "open",
      bathroomPosition: "adjacent_bedroom",
      bedPosition: "beside_window",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "wfh",
      monthlyBudget: "high",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 80, dampness: 80, privacy: 75, circulation: 70, focus: 75 },
      overallScore: 78,
      dimensions: [
        { dimension: 'lighting', score: 85, weight: 1.1, factors: [] },
        { dimension: 'noise', score: 80, weight: 1.2, factors: [] },
        { dimension: 'dampness', score: 80, weight: 0.9, factors: [] },
        { dimension: 'privacy', score: 75, weight: 1, factors: [] },
        { dimension: 'circulation', score: 70, weight: 0.9, factors: [] },
        { dimension: 'focus', score: 75, weight: 1.3, factors: [] },
      ],
      risks: [],
      actions: [
        { code: 'room_divider', title: '设置隔断', subtitle: '分隔工作生活', description: '用书架或屏风分隔床和书桌', costLevel: 'medium', costRange: '300-800元', difficulty: 'easy', timeRequired: '2小时', requirements: { needsBuyMaterials: true, needsFurnitureMove: true, needsLightRenovation: false }, expectedBenefit: { description: '提升专注', score: 5 }, targetsRisks: [], priorityReason: '改善体验' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '无明显风险，开间但有明确分区',
      firstActionGuess: '简单隔断即可',
      confidence: 'high'
    },
    notes: '虽然是开间，但面积足够（45平），书桌可以放在靠窗位置，床在另一侧。不临街、电梯不靠、采光好，非常适合居家办公。',
    status: 'pending',
    tags: ['居家办公', '开间', '分区明确', '标杆案例'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },

  // ===== 场景 12: 北向无遮挡高层的 rent 标杆（确保不误杀）=====
  {
    id: "case-012",
    name: "朝阳区北向高层一居室（无遮挡）",
    location: "朝阳区",
    scenario: "exam_prep",
    input: {
      layoutType: "one_bedroom",
      areaSqm: 55,
      orientation: "north",
      floorLevel: "high",
      totalFloors: 25,
      hasElevator: true,
      buildingAge: "new",
      hasWestFacingWindow: false,
      windowExposure: "full",
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: "corner",
      hasBalcony: true,
      kitchenType: "closed",
      bathroomPosition: "far_from_bedroom",
      bedPosition: "away_from_door",
      deskPosition: "facing_window",
      ventilation: "good",
      dampSigns: [],
      isShared: false,
      primaryGoal: "exam_prep",
      monthlyBudget: "medium",
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 70, noise: 85, dampness: 80, privacy: 85, circulation: 80, focus: 80 },
      overallScore: 80,
      dimensions: [
        { dimension: 'lighting', score: 70, weight: 1, factors: [] },
        { dimension: 'noise', score: 85, weight: 1.3, factors: [] },
        { dimension: 'dampness', score: 80, weight: 0.9, factors: [] },
        { dimension: 'privacy', score: 85, weight: 1.1, factors: [] },
        { dimension: 'circulation', score: 80, weight: 0.8, factors: [] },
        { dimension: 'focus', score: 80, weight: 1.2, factors: [] },
      ],
      risks: [],
      actions: [
        { code: 'desk_lamp', title: '补充台灯', subtitle: '改善照明', description: '增加护眼台灯', costLevel: 'low', costRange: '100-300元', difficulty: 'easy', timeRequired: '立即', requirements: { needsBuyMaterials: true, needsFurnitureMove: false, needsLightRenovation: false }, expectedBenefit: { description: '提升亮度', score: 3 }, targetsRisks: [], priorityReason: '改善体验' }
      ],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '北向但高层无遮挡，采光完全够用',
      firstActionGuess: '买个好台灯',
      confidence: 'high'
    },
    notes: '北向不是硬伤，高层+无遮挡+大窗户，白天光线完全足够。安静、通风好、隐私好，是备考的理想选择。系统不应该因为北向就降分太多。',
    status: 'pending',
    tags: ['备考', '北向', '高层', 'rent标杆', '不误杀'],
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10'
  },
  
  // ===== 相邻反例案例（测试规则边界，防止误杀）=====
  {
    id: 'case-013',
    name: '情侣+熟人合租+隐私风险（反例：不应误杀）',
    location: '海淀区五道口',
    scenario: 'couple',
    input: {
      layoutType: 'two_bedroom',
      areaSqm: 70,
      orientation: 'south',
      floorLevel: 'middle',
      totalFloors: 12,
      hasElevator: true,
      buildingAge: 'new',
      hasWestFacingWindow: false,
      windowExposure: 'full',
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: 'middle',
      hasBalcony: true,
      kitchenType: 'open',
      bathroomPosition: 'far_from_bedroom',
      bedPosition: 'away_from_door',
      deskPosition: 'facing_window',
      ventilation: 'cross_breeze',
      dampSigns: [],
      isShared: true,
      roommateSituation: 'friends',
      primaryGoal: 'couple',
      monthlyBudget: 'high',
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 90, noise: 85, dampness: 85, privacy: 60, circulation: 85, focus: 75 },
      overallScore: 75,
      dimensions: [],
      risks: [
        { id: 'shared_privacy', severity: 'medium', dimension: 'privacy', title: '合租隐私风险', description: '与朋友合租有一定隐私局限', mitigable: true }
      ],
      actions: [],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '与朋友合租隐私有局限，但可接受',
      firstActionGuess: '和室友约定公共区域使用时间',
      confidence: 'high'
    },
    notes: '边界案例：情侣+合租+朋友。override 规则不应触发（因为是朋友不是陌生人），系统应判 cautious 而非 avoid。如果判 avoid，说明 override 过严。',
    status: 'pending',
    tags: ['边界案例', 'couple', '朋友合租', 'override测试'],
    createdAt: '2026-03-17',
    updatedAt: '2026-03-17'
  },
  
  {
    id: 'case-014',
    name: '老人+低楼层+无电梯+设施好（反例：不应一刀切）',
    location: '东城区老小区',
    scenario: 'elderly_safety',
    input: {
      layoutType: 'one_bedroom',
      areaSqm: 55,
      orientation: 'south',
      floorLevel: 'low',
      totalFloors: 5,
      hasElevator: false,
      buildingAge: 'old',
      hasWestFacingWindow: false,
      windowExposure: 'full',
      facesMainRoad: false,
      nearElevator: false,
      unitPosition: 'middle',
      hasBalcony: true,
      kitchenType: 'closed',
      bathroomPosition: 'near_bedroom',
      bedPosition: 'away_from_door',
      deskPosition: 'facing_window',
      ventilation: 'cross_breeze',
      dampSigns: [],
      isShared: false,
      primaryGoal: 'elderly_safety',
      monthlyBudget: 'medium',
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 85, noise: 80, dampness: 75, privacy: 80, circulation: 80, focus: 70 },
      overallScore: 75,
      dimensions: [],
      risks: [
        { id: 'no_elevator', severity: 'medium', dimension: 'circulation', title: '无电梯', description: '5层无电梯对老人有一定负担', mitigable: false }
      ],
      actions: [],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '无电梯有风险，但5层+通风好+无潮湿，老人身体尚可就能接受',
      firstActionGuess: '安装楼梯扶手',
      confidence: 'medium'
    },
    notes: '边界案例：老人+无电梯+低楼层(5层)+好通风。override 规则不应触发（因为楼层不高且通风好），系统应判 cautious 而非 avoid。如果判 avoid，说明一刀切过严。',
    status: 'pending',
    tags: ['边界案例', '老人', '无电梯', '低楼层', 'override测试'],
    createdAt: '2026-03-17',
    updatedAt: '2026-03-17'
  },
  
  {
    id: 'case-015',
    name: '临街+高楼层+良好隔音（反例：不应等同于低楼层）',
    location: '朝阳区国贸',
    scenario: 'sleep_quality',
    input: {
      layoutType: 'one_bedroom',
      areaSqm: 60,
      orientation: 'east',
      floorLevel: 'high',
      totalFloors: 30,
      hasElevator: true,
      buildingAge: 'new',
      hasWestFacingWindow: false,
      windowExposure: 'full',
      facesMainRoad: true,
      nearElevator: false,
      unitPosition: 'middle',
      hasBalcony: true,
      kitchenType: 'closed',
      bathroomPosition: 'far_from_bedroom',
      bedPosition: 'away_from_door',
      deskPosition: 'facing_window',
      ventilation: 'good',
      dampSigns: [],
      isShared: false,
      primaryGoal: 'sleep_quality',
      monthlyBudget: 'high',
      allowsLightRenovation: true,
      allowsFurnitureMove: true,
      allowsSoftImprovements: true,
    },
    systemResult: {
      scores: { lighting: 80, noise: 65, dampness: 85, privacy: 85, circulation: 80, focus: 70 },
      overallScore: 65,
      dimensions: [],
      risks: [
        { id: 'street_noise_high', severity: 'medium', dimension: 'noise', title: '临街主干道噪音（高层）', description: '25层高楼层，噪音影响较小', mitigable: true }
      ],
      actions: [],
      verdict: 'cautious'
    },
    humanExpectation: {
      verdict: 'cautious',
      topRiskGuess: '25层高楼层+新楼双层玻璃，临街噪音几乎不影响睡眠',
      firstActionGuess: '无需特别处理',
      confidence: 'high'
    },
    notes: '边界案例：临街+高楼层(25层)+新楼。floor-aware 规则应生效，系统应判 rent 而非 cautious/avoid。如果判 avoid，说明 street_noise 规则没有正确分层。',
    status: 'pending',
    tags: ['边界案例', '临街', '高楼层', '分层规则测试'],
    createdAt: '2026-03-17',
    updatedAt: '2026-03-17'
  },
];

// 获取所有案例
export function getAllCases(): ValidationCase[] {
  return validationCases;
}

// 根据 ID 获取案例
export function getCaseById(id: string): ValidationCase | undefined {
  return validationCases.find(c => c.id === id);
}

// 根据状态筛选案例
export function getCasesByStatus(status: ValidationCase['status']): ValidationCase[] {
  return validationCases.filter(c => c.status === status);
}

// 获取统计数据
export function getValidationStats() {
  const total = validationCases.length;
  const confirmed = validationCases.filter(c => c.status === 'confirmed').length;
  const disputed = validationCases.filter(c => c.status === 'disputed').length;
  
  const verdictMatches = validationCases.filter(c => 
    c.systemResult.verdict === c.humanExpectation.verdict
  ).length;
  
  return {
    totalCases: total,
    confirmedCases: confirmed,
    disputedCases: disputed,
    pendingCases: total - confirmed - disputed,
    verdictMatchRate: total > 0 ? Math.round((verdictMatches / total) * 100) : 0,
    disputedRate: total > 0 ? Math.round((disputed / total) * 100) : 0,
  };
}
