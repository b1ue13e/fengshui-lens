/**
 * Mock 数据
 * 提供三组典型空间布局数据，用于测试规则引擎和开发 UI
 */

import { SpaceLayout, RoomType, Direction, RuleViolation } from '@/types/space';

// ==================== Mock 数据 1: 典型卧室（含多个常见问题） ====================
export const mockBedroom: SpaceLayout = {
  id: 'mock-bedroom-001',
  name: '主卧',
  roomType: 'bedroom',
  createdAt: '2026-03-17T10:00:00Z',
  
  outline: {
    width: 3.6,
    length: 4.2,
    height: 2.8,
    shape: 'rectangle',
  },
  
  orientation: 'south',
  
  doors: [
    {
      id: 'door-entrance',
      name: '房门',
      type: 'interior',
      position: { x: 0.1, y: 0.35 },
      size: { width: 0.9, length: 0.15 },
      facing: 'west',
      leadsTo: 'hallway',
    },
    {
      id: 'door-balcony',
      name: '阳台门',
      type: 'sliding',
      position: { x: 2.4, y: 4.05 },
      size: { width: 1.8, length: 0.15 },
      facing: 'south',
    },
  ],
  
  windows: [
    {
      id: 'window-main',
      name: '主窗',
      type: 'sliding',
      position: { x: 1.2, y: 0 },
      size: { width: 1.8, length: 0.1, height: 1.5 },
      facing: 'north',
    },
  ],
  
  furnitures: [
    // 床 - 问题：床头靠窗、可能横梁压顶
    {
      id: 'bed-main',
      name: '双人床',
      category: 'bed',
      position: { x: 1.0, y: 0.3 },
      size: { width: 1.8, length: 2.0 },
      facing: 'south',
      height: 0.6,
    },
    // 衣柜带镜子 - 问题：镜子对床
    {
      id: 'wardrobe-mirror',
      name: '镜面衣柜',
      category: 'mirror',
      position: { x: 3.0, y: 0.5 },
      size: { width: 0.6, length: 2.0 },
      facing: 'west',
      height: 2.2,
    },
    {
      id: 'wardrobe-cabinet',
      name: '衣柜主体',
      category: 'wardrobe',
      position: { x: 3.0, y: 0.5 },
      size: { width: 0.6, length: 2.0 },
      facing: 'west',
      height: 2.2,
      isFixed: true,
    },
    // 书桌 - 问题：背对门、光线可能不足
    {
      id: 'desk-study',
      name: '书桌',
      category: 'desk',
      position: { x: 0.2, y: 2.5 },
      size: { width: 1.2, length: 0.6 },
      facing: 'east',
      height: 0.75,
    },
    {
      id: 'chair-desk',
      name: '椅子',
      category: 'chair',
      position: { x: 0.5, y: 3.2 },
      size: { width: 0.5, length: 0.5 },
      facing: 'north',
    },
  ],
  
  zones: [
    {
      id: 'zone-sleep',
      name: '睡眠区',
      type: 'sleep',
      position: { x: 0.8, y: 0.2 },
      size: { width: 2.2, length: 2.4 },
    },
    {
      id: 'zone-work',
      name: '工作区',
      type: 'work',
      position: { x: 0.1, y: 2.3 },
      size: { width: 1.5, length: 1.5 },
    },
    {
      id: 'zone-transit',
      name: '通道',
      type: 'transit',
      position: { x: 0, y: 1.8 },
      size: { width: 3.6, length: 0.8 },
    },
  ],
  
  structures: [
    // 横梁 - 在床的上方
    {
      id: 'beam-main',
      name: '主梁',
      type: 'beam',
      position: { x: 0.5, y: 1.2 },
      size: { width: 3.0, length: 0.3 },
      heightFromFloor: 2.4,
    },
  ],
  
  userNotes: {
    primaryUse: '夫妻主卧，兼顾阅读工作',
    painPoints: [
      '镜子对着床晚上有点吓人',
      '床头靠近窗户冬天有点冷',
      '书桌背对门容易被打扰',
    ],
    goals: ['改善睡眠质量', '提升工作效率'],
    specialNeeds: '希望保持现有衣柜不动',
  },
};

// ==================== Mock 数据 2: 书房/工位（典型办公空间） ====================
export const mockStudy: SpaceLayout = {
  id: 'mock-study-001',
  name: '书房',
  roomType: 'study',
  createdAt: '2026-03-17T11:00:00Z',
  
  outline: {
    width: 2.8,
    length: 3.5,
    height: 2.6,
    shape: 'rectangle',
  },
  
  orientation: 'east',
  
  doors: [
    {
      id: 'door-main',
      name: '房门',
      type: 'interior',
      position: { x: 2.2, y: 3.35 },
      size: { width: 0.85, length: 0.15 },
      facing: 'south',
      leadsTo: 'living',
    },
  ],
  
  windows: [
    {
      id: 'window-east',
      name: '东窗',
      type: 'casement',
      position: { x: 2.7, y: 0.5 },
      size: { width: 0.1, length: 1.5, height: 1.4 },
      facing: 'east',
    },
  ],
  
  furnitures: [
    // 书桌 - 问题：背对门、正对厕所方向（假设）
    {
      id: 'desk-main',
      name: 'L型书桌',
      category: 'desk',
      position: { x: 0.3, y: 2.0 },
      size: { width: 1.6, length: 0.7 },
      facing: 'north',
      height: 0.75,
    },
    {
      id: 'chair-office',
      name: '办公椅',
      category: 'chair',
      position: { x: 0.6, y: 2.8 },
      size: { width: 0.6, length: 0.6 },
      facing: 'north',
    },
    // 书架
    {
      id: 'bookshelf-tall',
      name: '书架',
      category: 'bookshelf',
      position: { x: 0, y: 0 },
      size: { width: 0.4, length: 2.0 },
      facing: 'east',
      height: 2.0,
    },
    // 沙发床
    {
      id: 'sofa-bed',
      name: '沙发床',
      category: 'sofa',
      position: { x: 1.5, y: 0.2 },
      size: { width: 1.2, length: 0.8 },
      facing: 'south',
    },
    // 台灯
    {
      id: 'lamp-desk',
      name: '台灯',
      category: 'cabinet',
      position: { x: 0.4, y: 2.1 },
      size: { width: 0.2, length: 0.2 },
    },
  ],
  
  zones: [
    {
      id: 'zone-work-main',
      name: '主工作区',
      type: 'work',
      position: { x: 0.2, y: 1.8 },
      size: { width: 1.8, length: 1.2 },
    },
    {
      id: 'zone-rest',
      name: '休息区',
      type: 'rest',
      position: { x: 1.3, y: 0.1 },
      size: { width: 1.4, length: 1.2 },
    },
  ],
  
  structures: [
    // 横梁 - 在书桌上方
    {
      id: 'beam-desk',
      name: '次梁',
      type: 'beam',
      position: { x: 0.2, y: 2.2 },
      size: { width: 1.8, length: 0.25 },
      heightFromFloor: 2.3,
    },
  ],
  
  userNotes: {
    primaryUse: '居家办公，偶尔客人留宿',
    painPoints: [
      '工作时背后有人走动会分心',
      '下午西晒光线太强',
      '头顶有横梁感觉压抑',
    ],
    goals: ['提高工作效率', '改善用眼舒适度'],
    specialNeeds: '需要视频会议背景简洁',
  },
};

// ==================== Mock 数据 3: 小户型整体布局（开间/Studio） ====================
export const mockStudio: SpaceLayout = {
  id: 'mock-studio-001',
  name: '开间公寓',
  roomType: 'studio',
  createdAt: '2026-03-17T12:00:00Z',
  
  outline: {
    width: 5.0,
    length: 8.0,
    height: 2.7,
    shape: 'rectangle',
  },
  
  orientation: 'south',
  
  doors: [
    {
      id: 'door-entrance',
      name: '入户门',
      type: 'entrance',
      position: { x: 4.0, y: 7.85 },
      size: { width: 0.9, length: 0.15 },
      facing: 'south',
      leadsTo: 'corridor',
    },
    {
      id: 'door-bathroom',
      name: '卫生间门',
      type: 'interior',
      position: { x: 4.2, y: 5.5 },
      size: { width: 0.7, length: 0.15 },
      facing: 'west',
      leadsTo: 'bathroom',
    },
    {
      id: 'door-balcony',
      name: '阳台门',
      type: 'sliding',
      position: { x: 1.5, y: 0 },
      size: { width: 2.0, length: 0.15 },
      facing: 'north',
    },
  ],
  
  windows: [
    {
      id: 'window-balcony',
      name: '落地窗',
      type: 'fixed',
      position: { x: 1.5, y: 0 },
      size: { width: 2.0, length: 0.1, height: 2.2 },
      facing: 'north',
    },
  ],
  
  furnitures: [
    // 床 - 问题：床尾对入户门
    {
      id: 'bed-murphy',
      name: '墨菲床',
      category: 'bed',
      position: { x: 3.5, y: 6.0 },
      size: { width: 1.5, length: 2.0 },
      facing: 'south',
    },
    // 沙发
    {
      id: 'sofa-main',
      name: '沙发',
      category: 'sofa',
      position: { x: 0.5, y: 4.0 },
      size: { width: 2.0, length: 0.9 },
      facing: 'east',
    },
    // 电视
    {
      id: 'tv-unit',
      name: '电视柜',
      category: 'tv',
      position: { x: 2.6, y: 4.0 },
      size: { width: 0.4, length: 1.8 },
      facing: 'west',
    },
    // 书桌 - 问题：背后空、光线可能不足
    {
      id: 'desk-corner',
      name: '转角书桌',
      category: 'desk',
      position: { x: 3.8, y: 2.0 },
      size: { width: 1.0, length: 0.6 },
      facing: 'west',
    },
    // 餐桌
    {
      id: 'table-dining',
      name: '餐桌',
      category: 'table',
      position: { x: 0.3, y: 2.5 },
      size: { width: 1.2, length: 0.8 },
    },
    // 厨房橱柜 - 与睡眠区共用墙
    {
      id: 'kitchen-cabinet',
      name: '橱柜',
      category: 'cabinet',
      position: { x: 0, y: 6.5 },
      size: { width: 0.6, length: 1.5 },
      isFixed: true,
    },
    // 隔断屏风
    {
      id: 'partition-room',
      name: '屏风隔断',
      category: 'partition',
      position: { x: 3.0, y: 5.5 },
      size: { width: 0.1, length: 1.5 },
    },
  ],
  
  zones: [
    {
      id: 'zone-entrance',
      name: '玄关',
      type: 'entrance',
      position: { x: 3.5, y: 7.0 },
      size: { width: 1.5, length: 1.0 },
    },
    {
      id: 'zone-living',
      name: '起居区',
      type: 'rest',
      position: { x: 0.2, y: 3.0 },
      size: { width: 3.0, length: 3.0 },
    },
    {
      id: 'zone-sleep',
      name: '睡眠区',
      type: 'sleep',
      position: { x: 3.2, y: 5.5 },
      size: { width: 1.8, length: 2.5 },
    },
    {
      id: 'zone-work',
      name: '工作区',
      type: 'work',
      position: { x: 3.5, y: 1.5 },
      size: { width: 1.5, length: 2.0 },
    },
    {
      id: 'zone-transit',
      name: '主通道',
      type: 'transit',
      position: { x: 2.5, y: 0 },
      size: { width: 2.5, length: 8.0 },
    },
  ],
  
  structures: [],
  
  userNotes: {
    primaryUse: '单身公寓，兼顾起居、工作、睡眠',
    painPoints: [
      '入户门和阳台门正对，风很大',
      '厨房和床只隔一堵墙，晚上做饭有味道',
      '工作区采光不好，白天也要开灯',
    ],
    goals: ['功能分区更明确', '改善通风和采光'],
    specialNeeds: '需要灵活可变的空间，偶尔有朋友聚会',
  },
};

// ==================== 预设分析结果（用于UI开发） ====================

export const mockViolations: RuleViolation[] = [
  {
    ruleId: 'mirror-facing-bed',
    ruleName: '镜子正对床',
    severity: 'critical',
    category: 'psychology',
    affectedItems: [
      { type: 'furniture', id: 'bed-main', name: '床' },
      { type: 'furniture', id: 'wardrobe-mirror', name: '镜面衣柜' },
    ],
    traditionalReason: '镜面反射扰动睡眠气场，易产生惊扰，影响精神状态',
    modernReason: '夜间醒来时镜中倒影可能造成惊吓，影响睡眠质量和心理健康',
    fixSuggestions: [
      {
        priority: 'high',
        description: '给镜面衣柜加装布帘或不透明贴膜',
        action: 'add',
        difficulty: 'easy',
        estimatedCost: 'low',
      },
      {
        priority: 'medium',
        description: '移动镜子位置，避免正对床',
        action: 'move',
        difficulty: 'easy',
      },
    ],
    scoreImpact: 20,
  },
  {
    ruleId: 'bed-against-window',
    ruleName: '床头靠窗',
    severity: 'warning',
    category: 'comfort',
    affectedItems: [
      { type: 'furniture', id: 'bed-main', name: '床' },
      { type: 'window', id: 'window-main', name: '窗户' },
    ],
    traditionalReason: '缺乏靠山，气流直冲头部，不利于休息和安全感',
    modernReason: '窗户附近温度变化大、噪音多，且窗帘开关不便，影响睡眠质量',
    fixSuggestions: [
      {
        priority: 'high',
        description: '调整床的位置，使床头靠实墙',
        action: 'move',
        difficulty: 'moderate',
      },
      {
        priority: 'medium',
        description: '加装厚窗帘和窗密封条',
        action: 'add',
        difficulty: 'easy',
        estimatedCost: 'low',
      },
    ],
    scoreImpact: 15,
  },
  {
    ruleId: 'desk-back-to-door',
    ruleName: '书桌背门',
    severity: 'warning',
    category: 'psychology',
    affectedItems: [
      { type: 'furniture', id: 'desk-study', name: '书桌' },
      { type: 'door', id: 'door-entrance', name: '房门' },
    ],
    traditionalReason: '背后无靠，缺乏安全感，易受惊吓',
    modernReason: '无法感知身后来人，容易被打断且缺乏安全感，影响专注',
    fixSuggestions: [
      {
        priority: 'high',
        description: '调整书桌方向，面向或侧向门',
        action: 'move',
        difficulty: 'easy',
      },
      {
        priority: 'medium',
        description: '在桌边放置镜子反射门口',
        action: 'add',
        difficulty: 'easy',
        estimatedCost: 'low',
      },
    ],
    scoreImpact: 14,
  },
];

// ==================== 导出集合 ====================

export const mockSpaces = {
  bedroom: mockBedroom,
  study: mockStudy,
  studio: mockStudio,
};

// 获取特定空间类型的 mock 数据
export function getMockSpace(type: 'bedroom' | 'study' | 'studio'): SpaceLayout {
  return mockSpaces[type];
}

// 获取所有 mock 数据用于测试
export function getAllMockSpaces(): SpaceLayout[] {
  return [mockBedroom, mockStudy, mockStudio];
}
