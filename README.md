# SpaceRisk - 租房风险评估引擎

基于用户场景与房源数据的智能风险评估系统，提供 pass/cautious/avoid 三档判决及配套缓解建议。

## 快速开始

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 核心架构

### 评估流程

```
房源数据 → Adapter(transform) → 纯函数 evaluate() → 评估结果
                   ↓                    ↓
            inputQuality(confidence)  logEvaluation() → Shadow Log
```

**关键设计原则：**
- `evaluate()` 是纯函数，无副作用
- 所有副作用（日志、反馈）在 orchestration 层执行
- Adapter 负责数据清洗并生成 input quality 元数据

### 12 指标系统 (`/dev/metrics`)

为 Beta 内测提供的数据面板，混合实时影子日志与静态验证数据：

| # | 指标名 | 数据源 | 说明 |
|---|-------|-------|------|
| 1 | Total Evaluations | Shadow Log | 总评估次数 |
| 2 | Confidence Distribution | Shadow Log | 输入置信度分布 (high/medium/low) |
| 3 | Avg Warnings/Input | Shadow Log | 平均每次输入警告数 |
| 4 | Verdict Distribution | Shadow Log | Pass/Caution/Block 占比 |
| 5 | Pass by Primary Goal | Shadow Log | 各场景（备考/情侣/WFH等）通过率 |
| 6 | Override Trigger Rate | Validation Cases | 人工覆盖触发率（静态） |
| 7 | Decision Note Rate | Shadow Log | 触发决策说明的比例 |
| 8 | Positive Feedback Rate | Shadow Log* | 用户正面反馈率 (*<5样本时显示 N/A) |
| 9 | Negative Feedback Rate | Shadow Log* | 用户负面反馈率 (*<5样本时显示 N/A) |
| 10 | Cautious Negative Rate | Shadow Log* | 谨慎拒绝案例的负面反馈率 |
| 11 | Top Risk Hit Rate | Validation Cases | 首要风险匹配率（静态） |
| 12 | First Action Acceptable Rate | Validation Cases | 首条建议可接受率（静态） |

### 核心模块

```
lib/
├── engine/           # 纯函数评估核心
│   ├── evaluate.ts   # 主评估函数
│   ├── config.ts     # 场景配置与权重
│   └── rules/        # 风险检测规则
├── adapters/         # 数据转换层
│   └── listing-transformer.ts  # 生成 TransformResult + warnings + confidence
├── feedback/         # 反馈与日志
│   └── shadow-logger.ts        # Shadow Log 读写
├── validation/       # 验证系统
│   ├── fixtures.ts   # 15 个验证案例
│   └── metrics.ts    # 验证集指标计算
└── metrics/          # 聚合指标 (新)
    └── aggregate.ts  # 12 指标统一聚合
```

## 测试

```bash
npm test
```

当前状态：78 tests passing

主要测试类别：
- 纯函数测试 (`pure-function.test.ts`)
- 12套真实案例验证 (`validation-cases.test.ts`)
- 争议案例覆盖 (`disputed-cases.test.ts`)
- 排序校准回归 (`sorting-calibration.test.ts`)
- 数据转换警告 (`transformer-warnings.test.ts`)

## 技术栈

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest (测试)

## License

MIT
