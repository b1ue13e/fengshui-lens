import { ActionDefinition } from '@/types';

export const actionRegistry: Record<string, ActionDefinition> = {
  // === 遮光/采光类 ===
  blackout_curtain: {
    code: 'blackout_curtain',
    title: '安装遮光窗帘',
    subtitle: '解决西晒最有效的方式',
    description: '选择遮光率90%以上的窗帘，可有效阻挡阳光直射，降低室温3-5度',
    costLevel: 'low',
    costRange: '¥100-300',
    difficulty: 'easy',
    timeRequired: '30分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '可阻挡90%阳光，显著改善睡眠',
      score: 9,
    },
  },
  
  window_film: {
    code: 'window_film',
    title: '贴隔热遮光膜',
    subtitle: '低成本西晒解决方案',
    description: '单向透视隔热膜，既能遮光又能保护隐私，安装简单可DIY',
    costLevel: 'low',
    costRange: '¥50-150',
    difficulty: 'easy',
    timeRequired: '1小时',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: true,
    },
    expectedBenefit: {
      description: '阻隔紫外线和热量，降低室温',
      score: 8,
    },
  },
  
  reposition_bed: {
    code: 'reposition_bed',
    title: '调整床位避光',
    subtitle: '零成本改善',
    description: '将床移到远离西晒窗户的位置，或调整床头方向',
    costLevel: 'free',
    costRange: '免费',
    difficulty: 'easy',
    timeRequired: '20分钟',
    requirements: {
      needsBuyMaterials: false,
      needsFurnitureMove: true,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '直接避开西晒影响',
      score: 7,
    },
  },
  
  // === 隔音类 ===
  seal_strip: {
    code: 'seal_strip',
    title: '安装门窗密封条',
    subtitle: '低成本降噪首选',
    description: '在窗框和门框安装密封条，可显著降低噪音传入',
    costLevel: 'low',
    costRange: '¥30-80',
    difficulty: 'easy',
    timeRequired: '40分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: true,
    },
    expectedBenefit: {
      description: '可降低噪音10-15分贝',
      score: 8,
    },
  },
  
  thick_curtain: {
    code: 'thick_curtain',
    title: '更换厚绒窗帘',
    subtitle: '隔音+遮光双重效果',
    description: '选择天鹅绒或厚棉麻材质窗帘，兼具隔音和遮光功能',
    costLevel: 'medium',
    costRange: '¥200-500',
    difficulty: 'easy',
    timeRequired: '30分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '吸音降噪，改善睡眠环境',
      score: 8,
    },
  },
  
  white_noise: {
    code: 'white_noise',
    title: '使用白噪音设备/App',
    subtitle: '掩盖突发噪音',
    description: '白噪音机或手机App播放雨声、风声，掩盖电梯声和邻居噪音',
    costLevel: 'low',
    costRange: '¥0-200',
    difficulty: 'easy',
    timeRequired: '5分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '有效掩盖突发噪音，帮助入睡',
      score: 7,
    },
  },
  
  rug_carpet: {
    code: 'rug_carpet',
    title: '铺设大面积地毯',
    subtitle: '吸音改善楼上噪音',
    description: '在卧室或客厅铺设厚地毯，可吸收脚步声和回声',
    costLevel: 'medium',
    costRange: '¥200-800',
    difficulty: 'easy',
    timeRequired: '10分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: true,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '减少脚步声和室内回声',
      score: 6,
    },
  },
  
  earplugs: {
    code: 'earplugs',
    title: '降噪耳塞',
    subtitle: '临时应急方案',
    description: '睡眠时使用专业降噪耳塞，适合短期应急',
    costLevel: 'low',
    costRange: '¥20-50',
    difficulty: 'easy',
    timeRequired: '1分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '直接阻断噪音传入',
      score: 6,
    },
  },
  
  // === 隐私类 ===
  curtain_door: {
    code: 'curtain_door',
    title: '安装门帘',
    subtitle: '简单有效的隐私缓冲',
    description: '在卧室门或入户门安装门帘，增加隐私缓冲',
    costLevel: 'low',
    costRange: '¥50-150',
    difficulty: 'easy',
    timeRequired: '15分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: true,
    },
    expectedBenefit: {
      description: '增加隐私缓冲，避免直视',
      score: 7,
    },
  },
  
  room_divider: {
    code: 'room_divider',
    title: '增设屏风/隔断',
    subtitle: '空间分区利器',
    description: '使用屏风、置物架或窗帘轨道划分空间，提升隐私',
    costLevel: 'low',
    costRange: '¥100-500',
    difficulty: 'easy',
    timeRequired: '30分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: true,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '有效划分功能区，增加私密性',
      score: 8,
    },
  },
  
  // === 潮湿类 ===
  dehumidifier: {
    code: 'dehumidifier',
    title: '配置除湿机',
    subtitle: '主动除湿方案',
    description: '在潮湿区域放置除湿机，保持室内湿度在40-60%',
    costLevel: 'medium',
    costRange: '¥300-800',
    difficulty: 'easy',
    timeRequired: '10分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '有效控制湿度，防止霉变',
      score: 9,
    },
  },
  
  moisture_absorber: {
    code: 'moisture_absorber',
    title: '使用除湿盒/袋',
    subtitle: '低成本被动除湿',
    description: '在衣柜、角落放置氯化钙除湿盒，定期更换',
    costLevel: 'low',
    costRange: '¥30-100',
    difficulty: 'easy',
    timeRequired: '5分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '局部除湿，保护衣物',
      score: 6,
    },
  },
  
  ventilation_fan: {
    code: 'ventilation_fan',
    title: '增加换气扇/循环扇',
    subtitle: '改善空气流通',
    description: '在通风不良区域安装排气扇或使用空气循环扇',
    costLevel: 'low',
    costRange: '¥100-300',
    difficulty: 'easy',
    timeRequired: '20分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '强制通风，减少湿气聚集',
      score: 7,
    },
  },
  
  // === 专注类 ===
  folding_desk: {
    code: 'folding_desk',
    title: '添置折叠书桌',
    subtitle: '创造工作角落',
    description: '使用折叠桌在角落搭建临时工作区，不用时可收起',
    costLevel: 'low',
    costRange: '¥150-400',
    difficulty: 'easy',
    timeRequired: '15分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: true,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '建立工作边界，提升专注',
      score: 7,
    },
  },
  
  desk_lamp: {
    code: 'desk_lamp',
    title: '添置台灯补光',
    subtitle: '改善工作照明',
    description: '使用护眼台灯补充桌面照明，减少屏幕反光',
    costLevel: 'low',
    costRange: '¥100-300',
    difficulty: 'easy',
    timeRequired: '5分钟',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '改善桌面照度，减轻眼疲劳',
      score: 6,
    },
  },
  
  reposition_desk: {
    code: 'reposition_desk',
    title: '调整书桌位置',
    subtitle: '优化办公姿势',
    description: '将书桌转向侧窗或垂直于窗户，避免背光或反光',
    costLevel: 'free',
    costRange: '免费',
    difficulty: 'easy',
    timeRequired: '15分钟',
    requirements: {
      needsBuyMaterials: false,
      needsFurnitureMove: true,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '消除屏幕反光，改善采光',
      score: 7,
    },
  },
  
  // === 老人安全类 ===
  add_handrail: {
    code: 'add_handrail',
    title: '安装楼梯扶手',
    subtitle: '提升上下楼安全',
    description: '在楼梯两侧或单侧安装稳固扶手，帮助老人借力上下楼',
    costLevel: 'medium',
    costRange: '¥500-1500',
    difficulty: 'medium',
    timeRequired: '2-4小时',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: true,
    },
    expectedBenefit: {
      description: '显著降低跌倒风险，提升老人独立行动能力',
      score: 9,
    },
  },
  
  anti_slip: {
    code: 'anti_slip',
    title: '铺设防滑措施',
    subtitle: '地面防滑处理',
    description: '在浴室、厨房、楼梯等湿滑区域铺设防滑垫或安装防滑条',
    costLevel: 'low',
    costRange: '¥100-400',
    difficulty: 'easy',
    timeRequired: '1小时',
    requirements: {
      needsBuyMaterials: true,
      needsFurnitureMove: false,
      needsLightRenovation: false,
    },
    expectedBenefit: {
      description: '降低滑倒风险，特别适用于无电梯老人住户',
      score: 8,
    },
  },
};

export function getAction(code: string): ActionDefinition | undefined {
  return actionRegistry[code];
}

export function getAllActions(): ActionDefinition[] {
  return Object.values(actionRegistry);
}