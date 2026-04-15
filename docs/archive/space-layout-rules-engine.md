> 历史归档说明：这是旧实验阶段的空间布局规则文档。当前主产品已演进为“青年大学习”，相关评估能力现作为“租房工具专区”的内部模块保留。

# 空间布局规则引擎说明

## 架构概述

规则引擎采用声明式设计，每条规则独立定义，便于维护和扩展。

```
┌─────────────────────────────────────────────────────────┐
│                    RuleEngine                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │  1. 获取适用规则 (getRulesForRoomType)          │   │
│  │  2. 逐个执行 evaluate                           │   │
│  │  3. 收集违规项 (RuleViolation[])                │   │
│  │  4. 计算维度评分                                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ Rule 1  │    │ Rule 2  │    │ Rule N  │
    │ 门对门  │    │ 镜对床  │    │ ...     │
    └─────────┘    └─────────┘    └─────────┘
```

## 核心类型

### SpaceLayout - 空间数据结构
```typescript
interface SpaceLayout {
  id: string;              // 唯一标识
  roomType: RoomType;      // 房间类型
  outline: SpaceOutline;   // 空间轮廓（宽高）
  orientation: Direction;  // 整体朝向
  doors: Door[];          // 门的位置
  windows: Window[];      // 窗的位置
  furnitures: Furniture[]; // 家具布局
  zones: Zone[];          // 功能分区
  structures: StructuralElement[]; // 横梁等
  userNotes?: {...};      // 用户备注
}
```

### Rule - 规则定义
```typescript
interface Rule {
  id: string;                    // 规则标识
  name: string;                  // 显示名称
  description: string;           // 规则描述
  category: RuleCategory;        // 分类
  severity: 'critical' | 'warning' | 'suggestion';
  applicableRoomTypes: string[] | 'all';
  traditionalReason: string;     // 传统解释
  modernReason: string;          // 现代科学解释
  scoreImpact: number;           // 违规扣分
  evaluate: (space) => RuleViolation | null;
}
```

## 已实现的 12 条规则

| # | 规则ID | 名称 | 严重程度 | 适用房间 |
|---|--------|------|----------|----------|
| 1 | door-to-bedroom-door | 入户门直冲卧室门 | warning | bedroom, studio |
| 2 | door-to-window | 入户门直冲阳台/窗 | warning | all |
| 3 | mirror-facing-bed | 镜子正对床 | critical | bedroom |
| 4 | bed-against-window | 床头靠窗 | warning | bedroom |
| 5 | bed-feet-to-door | 床尾对门 | suggestion | bedroom |
| 6 | beam-over-bed | 横梁压床 | critical | bedroom |
| 7 | beam-over-desk | 横梁压桌 | warning | study, office |
| 8 | desk-back-to-door | 书桌背门 | warning | study, office |
| 9 | desk-facing-toilet | 书桌正对厕所门 | warning | study, office |
| 10 | kitchen-next-to-bed | 厨房紧邻卧室床头墙 | critical | bedroom |
| 11 | circulation-crossing | 动线穿堂 | warning | all |
| 12 | workstation-poor-light | 工位背后空且采光差 | warning | office, study |

## 使用示例

```typescript
import { ruleEngine } from '@/lib/rules';
import { mockBedroom } from '@/lib/mock-data';

// 执行分析
const violations = ruleEngine.analyze(mockBedroom);

// 计算评分
const { overall, byCategory } = ruleEngine.calculateScore(mockBedroom);

console.log(`总体评分: ${overall}`);
console.log('违规项:', violations);
```

## 扩展指南

### 添加新规则

1. 在 `lib/rules.ts` 中定义规则对象：

```typescript
const myNewRule: Rule = {
  id: 'my-rule-id',
  name: '规则名称',
  description: '规则描述',
  category: 'layout',
  severity: 'warning',
  applicableRoomTypes: ['bedroom'],
  traditionalReason: '传统解释...',
  modernReason: '现代科学解释...',
  scoreImpact: 10,
  evaluate(space) {
    // 检查逻辑
    const hasIssue = ...;
    
    if (hasIssue) {
      return {
        ruleId: this.id,
        ruleName: this.name,
        severity: this.severity,
        category: this.category,
        affectedItems: [...],
        traditionalReason: this.traditionalReason,
        modernReason: this.modernReason,
        fixSuggestions: [
          createFixSuggestion('high', '建议1', 'move', 'easy'),
        ],
        scoreImpact: this.scoreImpact,
      };
    }
    return null;
  },
};
```

2. 在 `registerDefaultRules()` 中注册：

```typescript
this.register(
  // ... 已有规则
  myNewRule
);
```

### 几何计算工具

规则引擎提供 `GeometryUtils` 工具集：

- `distance(p1, p2)` - 两点距离
- `center(rect)` - 矩形中心
- `isAligned(r1, r2)` - 是否对齐
- `isFacing(r1, r2)` - 是否正对
- `contains(rect, point)` - 点是否在矩形内
- `isAbove(item, beam)` - 物品是否在横梁下方

## 评分算法

```
初始分数: 100

对于每个违规项:
  总扣分 += violation.scoreImpact

维度分数 = 100 - 该维度所有违规项扣分之和
总体分数 = max(0, 100 - 总扣分)

严重级别权重:
- critical: 15-20 分
- warning: 10-15 分  
- suggestion: 5-8 分
```

## Mock 数据

提供三组典型场景：

1. **mockBedroom** - 典型卧室，包含镜子对床、床头靠窗、横梁压顶、书桌背门等问题
2. **mockStudy** - 书房/工位，包含横梁压桌、背对门、采光不足等问题
3. **mockStudio** - 开间公寓，包含穿堂风、厨房与床共用墙、工位采光差等问题

使用方式:
```typescript
import { mockBedroom, mockStudy, mockStudio } from '@/lib/mock-data';
import { mockViolations } from '@/lib/mock-data'; // 预设分析结果
```

## 后续集成建议

1. **可视化层**: 使用 SpaceLayout 数据渲染房间平面图，高亮显示违规位置
2. **规则配置**: 可添加 RuleConfig 类型，支持用户开启/关闭特定规则
3. **权重调整**: 允许用户调整 scoreImpact，适应个人偏好
4. **规则解释**: 使用 traditionalReason 和 modernReason 生成双语解释文本
5. **修复预览**: 基于 fixSuggestions 提供拖拽式布局调整预览
