# SpaceRisk

SpaceRisk 是一个面向租房场景的空间风险评估项目。它会把房源信息整理成统一输入，给出 `verdict`、核心风险、优先改进建议和决策提示，帮助更快做出保守但可解释的租房判断。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Prisma
- Vitest

## 本地运行

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run lint
npm run test:run
npm run build
```

## 目录说明

- `app/`: 页面、路由和 Server Actions
- `components/`: 复用 UI 组件
- `lib/engine/`: 核心评估引擎
- `lib/adapters/`: 房源数据清洗和转换
- `lib/feedback/`: 反馈与 shadow log
- `lib/metrics/`: 指标聚合
- `prisma/`: 数据模型

## 当前重点

- 保持 `verdict` 稳定
- 提升风险排序与首条建议的质量
- 用 shadow logs 和 disputed cases 持续回归校准
