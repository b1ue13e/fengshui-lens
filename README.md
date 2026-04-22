# 青年大学习

青年大学习是一个面向大学生、应届生和初入社会年轻人的**现实决策训练产品**。
当前版本先聚焦 **上海首次租房判断**，先帮用户判断这套房值不值得继续谈，再把到沪落地承接、场景训练、工具模板和后续路线接上。

> 当前这版前台 UI 已按 Kimi 参考稿重构：整体更接近 Kimi 那套简洁、直接、卡片化的信息结构。

---

## 这不是一个什么产品

它**不是**：

- 泛知识内容站
- 青年资讯门户
- 纯风水 / 纯空间评分工具
- 只会堆功能入口的资源广场

它更像一套：

- 把高频现实问题拆成判断链路
- 把“先看什么、先问什么、先做什么”讲清楚
- 用话术、清单、报告和路线承接下一步动作

---

## 当前产品主线

### 1. 首页
首页优先把用户送进 **租房判断主链**，而不是把资源平铺成门户。

### 2. 租房判断主链
当前主线是：

1. ` /rent/tools `：租房主入口
2. ` /rent/tools/analyze `：房源链接速读排坑
3. ` /rent/tools/evaluate `：完整租房判断起始页
4. ` /rent/tools/evaluate/basic `：基础房源信息
5. ` /rent/tools/evaluate/space `：现场空间风险
6. ` /rent/tools/evaluate/living `：现实决策底线
7. ` /rent/tools/report `：判断成果示例页
8. ` /rent/tools/report/[id] `：真实判断成果页
9. ` /rent/tools/compare `：两套房源对比

### 3. 到沪承接
当用户已经决定来上海后，再进入：

- ` /survival-plans/start `
- ` /resources `

### 4. 训练底盘
后续训练入口包括：

- ` /categories `：分类训练
- ` /categories/[slug] `：分类详情
- ` /scenario/[slug] `：单场景训练页
- ` /paths `：学习路径
- ` /toolkit `：工具模板
- ` /simulator `：沟通模拟器
- ` /search `：全站搜索

---

## 当前支持的核心能力

- 首页租房优先入口
- 房源链接速读排坑
- 三步完整租房判断流程
- 判断报告 / 对比 / 后续动作建议
- 到沪路线图承接
- 分类训练 / 场景训练页
- 工具模板 / 清单 / 话术
- 沟通模拟器
- 本地优先存储
- Supabase 可选同步

---

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Zustand
- Prisma + SQLite
- Supabase SSR（可选）
- Vitest
- Playwright（预览 / E2E）

---

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

默认地址：

- [http://localhost:3000](http://localhost:3000)

### 3. 生产构建与启动

```bash
npm run build
npm run start
```

---

## 常用命令

```bash
npm run lint
npm run test:run
npm run build
npm run smoke:routes
```

补充：

```bash
npm run test:e2e
npm run test:disputed
npm run test:fight
```

---

## 数据与存储

### 本地默认可运行
不配置云端也能跑：

- 内容走本地种子
- 用户进度走浏览器本地存储
- 租房判断结果可落到本地 SQLite

### SQLite / Prisma
本地数据库文件：

- `prisma/dev.db`

### Supabase（可选）
如果配置了 Supabase：

- 用户进度和反馈可同步到云端
- 内容读取可切换为 remote 模式

---

## 环境变量

最小可选配置：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_CONTENT_SOURCE=local
```

说明：

- `SUPABASE_CONTENT_SOURCE=local`：只同步用户进度 / 反馈，内容仍走本地种子
- `SUPABASE_CONTENT_SOURCE=remote`：内容也从 Supabase 读取
- `ENABLE_INTERNAL_PAGES=false`：生产环境默认隐藏 `/design` 和 `/dev/*`

---

## 推荐提交流程

提交前建议至少执行：

```bash
npm run lint
npm run build
```

如需额外确认路由：

```bash
npm run smoke:routes
```

---

## 当前产品边界

当前版本**认真支持**的是：

- 上海首次租房判断
- 判断后的到沪承接
- 与租房 / 初入社会有关的高频训练场景

当前**不假装支持**：

- 全国城市深度定制
- 完整房源平台能力
- 全量政策数据库

---

## 目录提示

高频前台页面主要在：

- `app/page.tsx`
- `app/rent/tools/*`
- `app/(app)/categories/*`
- `app/(app)/scenario/*`
- `app/search/page.tsx`
- `components/home/*`
- `components/search/*`
- `components/scenario/*`

租房判断相关逻辑主要在：

- `lib/engine/*`
- `lib/rent-tools/*`
- `lib/repositories/rent-tool-repository.ts`

---

## 备注

- 用户可见品牌统一为 **青年大学习**
- 当前 UI 已明显向 Kimi 参考稿靠拢
- 如果继续做前台一致性，下一步建议统一剩余的非核心长尾页面和内部设计页