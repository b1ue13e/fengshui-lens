<div align="center">

# SpaceRisk

**A conservative rental decision engine for scenario-aware housing evaluation**

[![Next.js](https://img.shields.io/badge/Next.js-App_Router-black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](#)
[![Tests](https://img.shields.io/badge/Tests-passing-brightgreen)](#)
[![Status](https://img.shields.io/badge/Status-Beta-orange)](#)
[![Strategy](https://img.shields.io/badge/Strategy-Conservative-yellow)](#)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](#)

**SpaceRisk** 是一个**保守策略版**的租房决策辅助引擎。  
它基于结构化房源信息输出 `verdict`、Top Risks、Top Actions、`decisionNote` 与 `confidence / warnings`，帮助用户在不同目标场景下更快判断一套房值不值得租。

[在线体验](https://fengshui-lens.vercel.app) · [Metrics 面板](https://fengshui-lens.vercel.app/dev/metrics)  
*Beta only / internal observation*

</div>

---

## 目录

- [项目定位](#项目定位)
- [为什么做它](#为什么做它)
- [输出内容](#输出内容)
- [设计原则](#设计原则)
- [当前状态](#当前状态)
- [在线体验](#在线体验)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [最小示例](#最小示例)
- [输入质量模型](#输入质量模型)
- [验证与观测](#验证与观测)
- [项目结构](#项目结构)
- [当前边界](#当前边界)
- [Beta 使用建议](#beta-使用建议)
- [路线图](#路线图)
- [License](#license)

---

## 项目定位

SpaceRisk 不是"房屋娱乐评分器"，也不是"黑盒 AI 推荐器"。

它更接近一个**保守型租房决策辅助引擎**，专注回答四个问题：

1. **这套房值不值得租**
2. **最大的问题是什么**
3. **先改什么最划算**
4. **哪些问题更像结构性缺陷，不值得继续补救**

它的目标不是替代人的最终判断，而是把零散房源信息压缩成一个**更可执行、可解释、可验证**的决策输出。

---

## 为什么做它

租房最难的部分，不是看到房源信息，而是把零散信息转成**可信判断**。

现实中的常见问题：

- 房源信息很多，但缺少结论
- 一些工具只有泛泛分析，没有明确决策
- "能不能租"和"先改什么"经常混在一起
- 结构性缺陷与可低成本补救的问题没有被区分

SpaceRisk 的思路是：

- 先给出一个**保守但稳定的 verdict**
- 再按场景输出**最值得优先关注的风险**
- 再输出**更像人会先做的动作**
- 最后把"其实更适合换房"的情况，用 `decisionNote` 单独表达出来

---

## 输出内容

给定一套标准化输入，`evaluate()` 当前返回以下核心字段：

### `verdict`
最终结论：

- `rent`
- `cautious`
- `avoid`

### `overallScore`
0–100 的辅助分值，用于帮助理解 verdict。  
当前版本更重视 **verdict 稳定性**，而不是追求分数本身的"精确感"。

### `risks`
当前场景下排序后的 Top Risks。  
风险层只回答：

> **这套房最严重的问题是什么。**

### `actions`
当前房源条件下排序后的 Top Actions。  
建议层只回答：

> **在这套房上，先做什么最值。**

### `decisionNote`
用于表达结构性缺陷或低改造收益场景。  
它**不参与 action card 排序**。

典型场景包括：

- 情侣 + 陌生人合租
- 老人 + 无电梯
- 场景需求与房源结构明显冲突

### `confidence / warnings`
反映的是：

> **输入转换可靠度**

而不是：

> **引擎判定正确率**

这能帮助开发者区分：

- 规则问题
- 排序问题
- 输入质量问题

---

## 设计原则

### 1. 保守策略优先
当前版本宁可输出 `cautious`，也不轻易放过高风险房源。

### 2. verdict 稳定性优先
在当前阶段，SpaceRisk 更重视 verdict 的稳定性，而不是过早追求排序的"完美拟合"。

### 3. 三层分离
系统明确拆分为三层：

- **Risk Ranking**：什么问题最严重
- **Recommendation Ranking**：先做什么最值
- **Decision Note**：这类问题是不是更像结构性缺陷

### 4. `evaluate()` 保持纯函数
`evaluate()` 具备以下约束：

- 相同输入，得到相同输出
- 无日志副作用
- 不依赖环境状态
- 可单测、可复用、可回归

### 5. 输入质量单独处理
输入质量与引擎判断分开处理。  
系统不会假装自己在低质量输入下仍然"什么都知道"。

---

## 当前状态

当前版本为 **Beta / 保守策略版**。

### 当前相对稳定的能力

- `verdict` 在当前验证案例中表现稳定
- override / fatal combo 触发率已控制在较低水平
- `decisionNote` 已从 action 排序中独立出来
- `/dev/cases` 可用于验证案例回放
- `/dev/metrics` 可用于 Beta 阶段数据观测

### 当前仍在持续校准的部分

- Top Risk 命中率
- First Action 可接受率
- 部分输入清洗规则
- 个别边界场景的规则覆盖（如北向采光）

### 当前更合适的理解方式

> **一个保守型租房决策辅助引擎**  
> 而不是一个"已经充分验证的自动决策系统"。

---

## 在线体验

- **App**: https://fengshui-lens.vercel.app
- **Metrics**: https://fengshui-lens.vercel.app/dev/metrics

> 说明：这些页面当前更适合 Beta 观测与内部验证，不代表系统已经完成大规模外部验证。

---

## 系统架构

项目当前大致分为四层：

### 1) Input / Adapter
原始房源数据 → 标准化引擎输入

职责：

- 原始字段解析
- 安全默认值降级
- transform warnings 生成
- confidence 计算

典型模块：

- `lib/adapters/listing-transformer.ts`

---

### 2) Engine
评分、风险识别、建议排序、verdict、decision note

职责：

- 风险层：识别并排序风险
- 建议层：识别并排序动作
- 决策层：生成 decision note
- 输出稳定的结构化结果

典型模块：

- `lib/engine/*`

---

### 3) Feedback / Logging
shadow logs、用户反馈、metrics 聚合

职责：

- 记录输入与结果
- 记录用户主观反馈
- 产出 Beta 观测指标
- 支撑 `/dev/metrics`

典型模块：

- `lib/feedback/*`
- `lib/metrics/*`

---

### 4) UI / Dev Tools
报告页、对比页、案例验证页、指标页

职责：

- 展示 report / compare
- 验证案例回放
- Beta 阶段内部观测
- 调试与校准支持

典型入口：

- `/dev/cases`
- `/dev/metrics`

---

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地运行

```bash
npm run dev
```

### 运行测试

```bash
npm test
```

### 常用开发页面

- `/dev/cases` - 验证案例回放
- `/dev/metrics` - Beta 观测面板

---

## 最小示例

### 直接调用引擎

```typescript
import { evaluate } from '@/lib/engine';

const result = evaluate({
  layoutType: 'one_bedroom',
  areaSqm: 45,
  orientation: 'south',
  floorLevel: 'middle',
  totalFloors: 18,
  hasElevator: true,
  buildingAge: 'new',

  hasWestFacingWindow: false,
  facesMainRoad: true,
  nearElevator: false,

  isShared: false,
  roommateSituation: undefined,

  primaryGoal: 'exam_prep',

  allowsLightRenovation: true,
  allowsFurnitureMove: true,
  allowsSoftImprovements: true,
});

console.log(result.verdict);
console.log(result.overallScore);
console.log(result.risks);
console.log(result.actions);
console.log(result.decisionNote);
```

### 通过 Adapter 清洗真实房源输入

```typescript
import { transformRawToEngineInput } from '@/lib/adapters/listing-transformer';
import { evaluate } from '@/lib/engine';

const transformed = transformRawToEngineInput(rawListing, {
  primaryGoal: 'sleep_quality',
  onWarning: (message, field) => {
    console.warn(`[transform] ${field}: ${message}`);
  },
});

const result = evaluate(transformed.input);

console.log(transformed.confidence);
console.log(transformed.warnings);
console.log(result.verdict);
```

---

## 输入质量模型

真实房源接入不可能永远干净，所以 SpaceRisk 在 adapter 层提供：

- `warnings`
- `confidence`

### warnings

每次转换时，系统会记录类似问题：

- 某字段缺失，使用默认值
- 某字段格式异常，做了降级解析
- 某字段语义模糊，按保守方式处理
- 某字段被忽略

示例结构：

```typescript
type TransformWarning = {
  field: string;
  code: 'missing' | 'invalid_format' | 'fallback_used' | 'ambiguous';
  message: string;
  severity: 'low' | 'medium' | 'high';
};
```

### confidence

当前 confidence 表达的是：

> 输入转换可靠度

不是模型自信程度，也不是判定正确率。

通常规则如下：

- **high**：输入完整，warning 很少
- **medium**：有若干中等 warning
- **low**：关键字段缺失或严重异常较多

这能帮助你快速判断：

- 是规则错了
- 还是输入本身就不可靠

---

## 验证与观测

SpaceRisk 当前配有完整的验证与观测链路。

### Validation

当前项目包含：

- 静态验证案例集
- 风险排序与建议排序回归测试
- override 稳健性验证
- 边界反例验证

这些机制的目标不是宣称系统"已经完美"，而是确保它能被持续校准。

### Metrics

当前 `/dev/metrics` 聚合 **12 个核心指标**，分为四类：

#### A. 输入质量
- Total Evaluations
- Confidence Distribution
- Avg Warnings per Input

#### B. 引擎输出
- Verdict Distribution
- Rent Rate by Primary Goal
- Override Trigger Rate
- Decision Note Rate

#### C. 用户反馈
- Positive Feedback Rate
- Negative Feedback Rate
- Cautious Negative Rate

#### D. 校准质量
- Top Risk Hit Rate
- First Action Acceptable Rate

这些指标用于回答：

- 系统是否过于保守
- 问题出在输入、规则还是排序
- 用户是否信任当前结果
- 下一轮应该优先修哪一层

---

## 项目结构

```
app/
  dev/
    cases/          # 验证案例回放
    metrics/        # Beta 观测面板
  report/           # 评估报告
  compare/          # 对比页面

components/
  ui/               # shadcn/ui 组件
  report/           # 报告专用组件

lib/
  adapters/         # 数据适配层
  engine/           # 评估引擎核心
  feedback/         # 反馈与日志
  metrics/          # 指标聚合
  actions/          # 动作映射
  constants/        # 业务常量
  types/            # 类型定义
```

目录可能继续演化，但当前核心边界已基本稳定：
`adapter / engine / feedback-metrics / UI-dev tools`

---

## 当前边界

当前版本的边界比较明确：

### 1. 依赖结构化输入
系统当前不直接理解完整房源网页。
真实房源接入仍依赖 adapter 清洗质量。

### 2. 排序质量当前弱于 verdict 稳定性
当前 verdict 更稳，Top Risk 和 First Action 仍在持续校准。

### 3. 部分规则覆盖仍可扩展
例如：

- 北向采光不足
- 更细粒度的窗外遮挡信息
- 更真实的楼层噪音衰减
- 更丰富的共享居住约束

### 4. Beta 指标样本仍有限
在样本量较小时，部分反馈指标会显示 N/A 或样本不足提示。

---

## Beta 使用建议

如果你准备在内部或小范围试用，建议使用以下口径：

> SpaceRisk 当前为保守策略版租房决策辅助引擎：优先避免放过高风险房源，在当前验证案例中 verdict 表现稳定，但风险排序与第一建议动作仍在持续校准中。

### 建议使用方式

- 优先用于内部决策辅助，而不是唯一判断依据
- 优先观察 cautious 房源上的用户反馈
- 保持 `/dev/metrics` 与 `/dev/cases` 持续更新
- 在真实样本积累前，尽量冻结 verdict 骨架

---

## 路线图

当前最值得继续推进的方向：

- [ ] 提升 Top Risk 命中率
- [ ] 提升 First Action 可接受率
- [ ] 扩展规则覆盖与真实案例集
- [ ] 完善 decisionNote 的正式展示体验
- [ ] 增强 adapter 对真实房源脏数据的鲁棒性
- [ ] 基于真实用户反馈继续校准 recommendation ranking

---

## License

[MIT](./LICENSE)
