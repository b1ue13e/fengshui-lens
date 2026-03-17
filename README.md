# FengShui Lens · 租房风险评估引擎

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Vitest-Test-6E9F18?style=flat-square&logo=vitest" />
</p>

<p align="center">
  <b>基于用户场景的智能租房风险评估系统</b><br/>
  提供 <code>rent</code> / <code>cautious</code> / <code>avoid</code> 三档判决 + 可操作建议
</p>

<p align="center">
  <a href="https://fengshui-lens.vercel.app" target="_blank">🌐 在线体验</a> ·
  <a href="#-快速开始">⚡ 快速开始</a> ·
  <a href="#-架构文档">📚 架构文档</a> ·
  <a href="#-api-参考">🔌 API</a>
</p>

---

## ✨ 功能特性

### 核心评估
- **场景化评估** - 根据用户目标（备考/WFH/情侣/老人等）动态调整权重
- **纯函数引擎** - 评估逻辑无副作用，可预测、可测试
- **三档判决** - `rent` (值得租) / `cautious` (谨慎考虑) / `avoid` (不建议租)
- **Decision Note** - 对谨慎案例自动说明决策依据

### 数据采集
- **智能提取** - 支持从小红书等房源链接自动提取结构化数据
- **输入质量评估** - 自动检测数据缺失，标记置信度 (high/medium/low)
- **Shadow Log** - 全链路影子日志，用于 Beta 阶段观测

### Beta 观测面板 (`/dev/metrics`)
- **12 核心指标** - 混合实时数据与静态验证集
- **反馈闭环** - 用户反馈率、准确率追踪
- **校准监控** - 首要风险命中率、建议可接受率

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm / yarn / pnpm

### 安装

```bash
# 克隆项目
git clone https://github.com/你的用户名/fengshui-lens.git
cd fengshui-lens

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入必要的 API Key
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 构建

```bash
npm run build
npm start
```

### 测试

```bash
npm test              # 交互模式
npm run test:run      # 一次性运行
```

---

## 🏗️ 架构文档

### 评估流程

```
房源链接/手动输入
      ↓
┌─────────────────┐
│ Adapter Layer   │  ← 数据清洗 + 生成 inputQuality
│ (transform)     │    (confidence, warnings)
└────────┬────────┘
         ↓
┌─────────────────┐
│ 纯函数 evaluate │  ← 核心业务逻辑
│ (engine)        │    无副作用，可预测
└────────┬────────┘
         ↓
┌─────────────────┐
│ Shadow Logger   │  ← 记录评估结果
│ (feedback)      │    用于 Beta 观测
└─────────────────┘
         ↓
   展示结果 + 收集反馈
```

### 项目结构

```
fengshui-lens/
├── app/                      # Next.js App Router
│   ├── api/                  # API 路由
│   │   ├── extract-listing/  # 房源数据提取
│   │   └── feedback/         # 反馈收集
│   ├── evaluate/             # 评估页面
│   │   ├── living/           # 居住评估
│   │   └── space/            # 空间评估
│   ├── report/               # 评估报告
│   ├── result/               # 结果展示
│   └── dev/                  # 开发工具
│       ├── metrics/          # Beta 观测面板 ⭐
│       └── cases/            # 案例管理
│
├── lib/
│   ├── engine/               # 评估引擎核心
│   │   ├── index.ts          # 主评估函数
│   │   ├── rules.ts          # 风险规则
│   │   ├── types.ts          # 类型定义
│   │   └── __tests__/        # 引擎测试
│   │
│   ├── adapters/             # 数据适配层
│   │   ├── listing-transformer.ts
│   │   └── evaluation-adapter.ts
│   │
│   ├── feedback/             # 反馈系统
│   │   ├── shadow-logger.ts  # 影子日志
│   │   └── shadow-log.ts     # 存储接口
│   │
│   ├── metrics/              # 指标聚合
│   │   └── aggregate.ts      # 12 指标计算
│   │
│   ├── validation/           # 验证系统
│   │   ├── fixtures.ts       # 15 套验证案例
│   │   ├── fixtures-updated.ts
│   │   └── metrics.ts        # 验证指标
│   │
│   ├── llm/                  # LLM 集成
│   │   ├── client.ts
│   │   ├── prompts.ts
│   │   └── schemas.ts
│   │
│   └── constants/            # 业务常量
│       └── evaluation.ts     # 枚举定义
│
├── components/               # React 组件
│   └── ui/                   # shadcn/ui 组件
│
├── prisma/                   # 数据库 Schema
│   └── schema.prisma
│
├── docs/                     # 文档
│   ├── LLM_FALLBACK.md
│   └── ...
│
└── public/                   # 静态资源
```

### 核心类型系统

```typescript
// Verdict 枚举 - 唯一真相源
type Verdict = 'rent' | 'cautious' | 'avoid'

// 评估结果
interface EvaluationResult {
  verdict: Verdict
  overallScore: number
  risks: RiskItem[]
  actions: ActionItem[]
  decisionNote?: string  // 谨慎/拒绝时说明
}

// 输入质量元数据
interface InputQuality {
  confidence: 'high' | 'medium' | 'low'
  warningCount: number
  missingFields: string[]
}
```

---

## 🔌 API 参考

### 提取房源数据

```http
POST /api/extract-listing
Content-Type: application/json

{
  "url": "https://www.xiaohongshu.com/..."
}
```

### 提交反馈

```http
POST /api/feedback/shadow-log
Content-Type: application/json

{
  "entryId": "uuid",
  "feedback": {
    "isAccurate": false,
    "comment": "风险判断过于保守"
  }
}
```

---

## 📊 12 核心指标说明

| # | 指标 | 数据源 | 说明 |
|---|------|--------|------|
| 1 | Total Evaluations | Shadow Log | 总评估次数 |
| 2 | Confidence Distribution | Shadow Log | 输入置信度分布 |
| 3 | Avg Warnings/Input | Shadow Log | 平均警告数/输入 |
| 4 | Verdict Distribution | Shadow Log | rent/cautious/avoid 占比 |
| 5 | Rent Rate by Goal | Shadow Log | 各场景 rent 比例 |
| 6 | Override Trigger Rate | Validation | 覆盖规则触发率 |
| 7 | Decision Note Rate | Shadow Log | 触发决策说明比例 |
| 8 | Positive Feedback Rate | Shadow Log* | 正面反馈率 |
| 9 | Negative Feedback Rate | Shadow Log* | 负面反馈率 |
| 10 | Cautious Negative Rate | Shadow Log* | 谨慎案例负面反馈率 |
| 11 | Top Risk Hit Rate | Validation | 首要风险命中率 |
| 12 | First Action Acceptable | Validation | 首条建议可接受率 |

> *样本不足 (n<5) 时显示 N/A

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 覆盖率报告
npm run test:coverage
```

### 测试分类

| 测试文件 | 说明 |
|----------|------|
| `pure-function.test.ts` | 引擎纯函数行为验证 |
| `validation-cases.test.ts` | 15 套验证案例回归 |
| `disputed-cases.test.ts` | 争议案例专项覆盖 |
| `sorting-calibration.test.ts` | 排序算法校准 |
| `transformer-warnings.test.ts` | 数据转换警告 |

---

## 🚀 部署

### Vercel (推荐)

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `OPENAI_API_KEY` | LLM API Key | 是 |
| `NEXT_PUBLIC_APP_URL` | 应用域名 | 否 |

---

## 📄 相关文档

- [RULES_ENGINE.md](./RULES_ENGINE.md) - 规则引擎详解
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - 使用指南
- [FINAL_REPORT.md](./FINAL_REPORT.md) - 项目总结报告
- [docs/LLM_FALLBACK.md](./docs/LLM_FALLBACK.md) - LLM 降级策略

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/xxx`)
3. 提交更改 (`git commit -m 'feat: xxx'`)
4. 推送分支 (`git push origin feature/xxx`)
5. 创建 Pull Request

---

## 📜 License

[MIT](./LICENSE)

---

<p align="center">
  Made with ❤️ for better renting decisions
</p>
