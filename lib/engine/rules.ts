import { Rule } from './types';

// 15条核心规则 - 所有常量使用 snake_case
export const rules: Rule[] = [
  // === 采光维度 (Lighting) ===
  
  // 规则1: 优秀朝向加分
  {
    id: 'good_orientation',
    name: '良好朝向',
    condition: (input) => input.hasGoodOrientation,
    effects: {
      scoreDeltas: { lighting: 15 },
    },
  },
  
  // 规则2: 西晒严重（睡眠场景）
  {
    id: 'west_sun_bedroom',
    name: '卧室西晒',
    condition: (input) => input.hasWestFacingWindow && input.primaryGoal === 'sleep_quality',
    effects: {
      scoreDeltas: { lighting: -12, focus: -8 },
      risk: {
        severity: 'high',
        dimension: 'lighting',
        title: '卧室西晒严重',
        description: '下午强烈的西晒会导致卧室温度升高3-5度，影响入睡',
        modernReason: '西晒导致下午室温过高，影响睡眠质量，增加空调能耗',
      },
      actionHints: ['blackout_curtain', 'window_film', 'reposition_bed'],
    },
  },
  
  // 规则3: 西晒（办公场景影响较小）
  {
    id: 'west_sun_wfh',
    name: '西晒办公影响',
    condition: (input) => input.hasWestFacingWindow && input.primaryGoal === 'wfh',
    effects: {
      scoreDeltas: { lighting: -8, focus: -5 },
      risk: {
        severity: 'medium',
        dimension: 'lighting',
        title: '下午西晒影响办公',
        description: '下午强烈的阳光会造成屏幕反光和室温升高',
        modernReason: '屏幕反光影响工作效率，高温导致疲劳',
      },
      actionHints: ['window_film', 'blackout_curtain'],
    },
  },
  
  // 规则4: 窗户被遮挡
  {
    id: 'window_blocked',
    name: '窗户遮挡',
    condition: (input) => input.windowExposure === 'blocked',
    effects: {
      scoreDeltas: { lighting: -20, dampness: -10 },
      risk: {
        severity: 'high',
        dimension: 'lighting',
        title: '采光严重不足',
        description: '窗户被外部建筑或树木严重遮挡',
        modernReason: '自然光不足影响昼夜节律，可能导致季节性情绪失调',
      },
      actionHints: ['supplemental_light', 'light_color_paint'],
    },
  },
  
  // 规则5: 低楼层采光差
  {
    id: 'low_floor_light',
    name: '低楼层采光',
    condition: (input) => input.isLowFloor && input.windowExposure !== 'full',
    effects: {
      scoreDeltas: { lighting: -10 },
      risk: {
        severity: 'medium',
        dimension: 'lighting',
        title: '低楼层采光受限',
        description: '楼层较低，易受周边建筑遮挡影响采光',
        modernReason: '低楼层自然光照时间较短，白天可能需要人工照明',
      },
    },
  },

  // === 噪音维度 (Noise) ===
  
  // 规则6a: 临街主干道（低楼层/中楼层）- 噪音严重
  {
    id: 'street_noise_low',
    name: '临街噪音（低楼层）',
    condition: (input) => input.facesMainRoad && (input.floorLevel === 'low' || input.floorLevel === 'middle'),
    effects: {
      scoreDeltas: { noise: -25, focus: -20 },
      risk: {
        severity: 'high',
        dimension: 'noise',
        title: '临街主干道噪音',
        description: '卧室或主要生活区临街，受车流噪音影响（低/中楼层噪音更严重）',
        modernReason: '持续噪音超过50分贝会影响睡眠质量和专注力，长期可能导致健康问题',
      },
      actionHints: ['seal_strip', 'thick_curtain', 'white_noise'],
    },
  },
  
  // 规则6b: 临街主干道（高楼层）- 噪音相对较轻，但仍有影响
  {
    id: 'street_noise_high',
    name: '临街噪音（高楼层）',
    condition: (input) => {
      if (!input.facesMainRoad || input.floorLevel !== 'high') return false;
      // 新楼高楼层场景，噪音影响大幅降低，走 attenuated 规则
      if (input.buildingAge === 'new') return false;
      return true;
    },
    effects: {
      scoreDeltas: { noise: -15, focus: -10 },
      risk: {
        severity: 'medium',
        dimension: 'noise',
        title: '临街主干道噪音',
        description: '卧室或主要生活区临街，高楼层噪音相对较轻',
        modernReason: '高楼层噪音相对较低，通过密封措施可有效改善',
      },
      actionHints: ['seal_strip', 'thick_curtain', 'white_noise'],
    },
  },
  
  // 规则6c: 临街主干道（高楼层+新楼）- 噪音影响轻微，不生成风险卡
  {
    id: 'street_noise_attenuated',
    name: '临街噪音（高楼层新楼）',
    condition: (input) => input.facesMainRoad && input.floorLevel === 'high' && input.buildingAge === 'new',
    effects: {
      scoreDeltas: { noise: -5 },  // 轻微影响，不生成 risk
      actionHints: ['seal_strip'],  // 可选措施
    },
  },
  
  // 规则7: 电梯旁
  {
    id: 'elevator_noise',
    name: '电梯噪音',
    condition: (input) => input.nearElevator,
    effects: {
      scoreDeltas: { noise: -15, focus: -10 },
      risk: {
        severity: 'medium',
        dimension: 'noise',
        title: '电梯运行噪音',
        description: '房间紧邻电梯井或电梯厅',
        modernReason: '电梯运行产生的低频噪音和提示音可能干扰睡眠',
      },
      actionHints: ['white_noise', 'earplugs'],
    },
  },
  
  // 规则8: 老旧小区隔音差
  {
    id: 'old_building_noise',
    name: '老楼隔音差',
    condition: (input) => input.buildingAge === 'old' && (input.isShared || input.unitPosition === 'middle'),
    effects: {
      scoreDeltas: { noise: -12, privacy: -10 },
      risk: {
        severity: 'medium',
        dimension: 'noise',
        title: '建筑隔音性能差',
        description: '2000年前建造的老旧建筑，墙体和楼板较薄',
        modernReason: '老旧建筑隔音标准低，容易听到邻居声音',
      },
      actionHints: ['rug_carpet', 'white_noise'],
    },
  },

  // === 潮湿维度 (Dampness) ===
  
  // 规则9: 通风不良
  {
    id: 'poor_ventilation',
    name: '通风不良',
    condition: (input) => input.ventilation === 'poor' || input.ventilation === 'none',
    effects: {
      scoreDeltas: { dampness: -20, circulation: -15 },
      risk: {
        severity: 'high',
        dimension: 'dampness',
        title: '室内通风严重不足',
        description: '户型设计导致空气难以流通',
        modernReason: '通风不良导致湿气聚集，容易滋生霉菌，影响呼吸道健康',
      },
      actionHints: ['ventilation_fan', 'dehumidifier'],
    },
  },
  
  // 规则10: 已有潮湿迹象
  {
    id: 'damp_signs',
    name: '潮湿迹象',
    condition: (input) => !!input.dampSigns && input.dampSigns.length > 0,
    effects: {
      scoreDeltas: { dampness: -25, focus: -10 },
      risk: {
        severity: 'high',
        dimension: 'dampness',
        title: '已有潮湿霉变',
        description: '墙面、衣柜或卫生间有返潮、霉味或冷凝水',
        modernReason: '霉菌孢子可能引发过敏和呼吸道问题，且难以根除',
      },
      actionHints: ['dehumidifier', 'moisture_absorber', 'ventilation_fan'],
    },
  },
  
  // 规则11a: 无电梯（老人场景高危）
  {
    id: 'no_elevator',
    name: '无电梯',
    condition: (input) => !input.hasElevator && input.totalFloors > 4,
    effects: {
      scoreDeltas: { circulation: -20 },
      risk: {
        severity: 'high',
        dimension: 'circulation',
        title: '无电梯',
        description: '4层以上无电梯，需要爬楼梯',
        modernReason: '老人或行动不便者上下楼困难，紧急情况疏散不便',
      },
      actionHints: ['add_handrail', 'move_to_lower'],
    },
  },
  
  // 规则11b: 底楼潮湿
  {
    id: 'ground_floor_damp',
    name: '底楼潮湿',
    condition: (input) => input.floorLevel === 'low' && input.totalFloors > 5,
    effects: {
      scoreDeltas: { dampness: -15 },
      risk: {
        severity: 'medium',
        dimension: 'dampness',
        title: '低楼层易受潮',
        description: '一楼或低楼层容易受地下潮气影响',
        modernReason: '接近地面，湿度较高，梅雨季尤其明显',
      },
    },
  },

  // === 隐私维度 (Privacy) ===
  
  // 规则12: 床位隐私差
  {
    id: 'bed_privacy',
    name: '床位隐私',
    condition: (input) => input.bedPosition === 'facing_door' || input.bedPosition === 'near_door',
    effects: {
      scoreDeltas: { privacy: -15, focus: -10 },
      risk: {
        severity: 'medium',
        dimension: 'privacy',
        title: '卧室门对床或床近门',
        description: '开门直接看到床，或床离门太近',
        modernReason: '缺乏隐私缓冲，容易被惊扰，缺乏安全感',
      },
      actionHints: ['curtain_door', 'room_divider', 'reposition_bed'],
    },
  },
  
  // 规则13: 合租隐私风险
  {
    id: 'shared_privacy',
    name: '合租隐私',
    condition: (input) => input.isShared,
    effects: {
      scoreDeltas: { privacy: -20 },
      risk: {
        severity: 'high',
        dimension: 'privacy',
        title: '合租隐私风险',
        description: '与他人合租，共享公共区域',
        modernReason: '生活节律不同可能互相干扰，且存在安全隐患',
      },
      actionHints: ['room_divider', 'lock_install'],
    },
  },

  // === 专注维度 (Focus) ===
  
  // 规则14: 无独立书桌空间
  {
    id: 'no_desk_space',
    name: '无书桌空间',
    condition: (input) => input.deskPosition === 'no_space' && input.primaryGoal === 'wfh',
    effects: {
      scoreDeltas: { focus: -25, circulation: -10 },
      risk: {
        severity: 'high',
        dimension: 'focus',
        title: '无独立办公空间',
        description: '户型太小，无法在卧室或客厅设置独立工作区',
        modernReason: '工作与生活空间混用，边界模糊，影响工作效率和心理健康',
      },
      actionHints: ['folding_desk', 'room_divider'],
    },
  },
  
  // 规则15: 书桌背窗（反光）
  {
    id: 'desk_back_window',
    name: '书桌背窗',
    condition: (input) => input.deskPosition === 'back_to_window' && input.primaryGoal === 'wfh',
    effects: {
      scoreDeltas: { focus: -10, lighting: -5 },
      risk: {
        severity: 'low',
        dimension: 'focus',
        title: '屏幕反光影响办公',
        description: '背对窗户放置书桌，屏幕易产生反光',
        modernReason: '屏幕反光导致眼疲劳，且背后光线变化影响专注',
      },
      actionHints: ['desk_lamp', 'reposition_desk'],
    },
  },
];

export function getRules(): Rule[] {
  return rules;
}
