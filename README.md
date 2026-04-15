# 青年大学习

青年大学习是一款面向中国大学生、实习生和刚进入社会年轻人的现实场景生存指南 Web App / PWA，其中包含租房风险评估等高级工具。它不做资讯流，不讲空泛大道理，而是把第一次租房、第一次办银行卡、第一次看病、第一次看工资条这类真实场景，拆成可以立刻照着做的步骤、清单、话术和风险提醒。

当前仓库的默认主线已经切换为青年大学习 MVP。仓库中保留的房源解析、风险评估、房源对比与报告生成功能，现作为“租房工具专区”的高级模块存在；历史 FengShui Lens / SpaceRisk 文档已归档，不再代表当前默认产品定位。

## MVP 已实现

- 首页：搜索入口、热门场景、新手必学、紧急处理、最近学习、学习路径推荐
- 分类页与分类详情页：9 个主分类、卡片化场景导航
- 场景详情页：步骤、准备材料、避坑提醒、FAQ、话术模板、可勾选清单、学完自测
- 学习路径页：5 条阶段路线、进度条、下一步推荐
- 工具箱页：10+ 可复制 / 可下载模板
- 对话模拟器：6 个规则驱动场景，支持目标选择、分支反馈和推荐话术
- 个人中心：收藏、完成、最近学习、工具收藏、反馈、主题切换
- 登录同步：支持 Supabase 邮箱魔法链接登录；未配置 Supabase 时自动回退到本地模式
- 本地种子：内置 38 个场景、5 条学习路径、10+ 工具模板、6 组模拟器数据

## 技术栈

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui
- Zustand
- next-themes
- Fuse.js
- Supabase SSR（可选）
- Vitest

## 本地运行

最简单的演示方式不需要任何环境变量：

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可浏览全部 MVP 功能。

常用命令：

```bash
npm run lint
npm run test:run
npm run build
npm run smoke:routes
npm run seed:export
```

## 环境变量

默认不配环境变量也能运行，应用会使用 `lib/content/seed.ts` 里的本地种子数据，并把收藏 / 最近学习等状态保存在浏览器本地。

如果你想启用登录同步，请复制 `.env.example` 为 `.env.local`，至少补齐这些值：

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_CONTENT_SOURCE=local
```

说明：

- `SUPABASE_CONTENT_SOURCE=local`：默认继续走本地内容种子，只把用户进度和反馈同步到 Supabase
- `SUPABASE_CONTENT_SOURCE=remote`：为后续把 `scenarios` 等内容表迁移到 Supabase 预留
- `ENABLE_INTERNAL_PAGES=false`：默认在生产环境隐藏 `/design` 与 `/dev/*` 内部页面；本地开发环境不受影响

## 目录结构

```text
app/
  (app)/
  auth/callback/
  login/
  search/
components/
  home/
  login/
  paths/
  profile/
  scenario/
  search/
  shared/
  simulator/
  toolkit/
  ui/
lib/
  content/
  repositories/
  search/
  store/
  supabase/
  types/
supabase/
  migrations/
  seeds/
scripts/
```

## 数据与内容

- 本地内容源：`lib/content/seed.ts`
- Supabase 初始化 SQL：`supabase/migrations/20260414_init_young_study.sql`
- Supabase 种子导出说明：`supabase/seeds/README.md`
- JSON 导出脚本：`npm run seed:export`

执行 `npm run seed:export` 后，会生成：

```text
supabase/seeds/young-study.seed.json
```

这个文件会把当前本地种子拆成适合 Supabase 导入的表结构 JSON，包括：

- `categories`
- `scenarios`
- `scenario_sections`
- `scenario_checklists`
- `scenario_checklist_items`
- `scenario_faqs`
- `scenario_scripts`
- `scenario_quizzes`
- `learning_paths`
- `learning_path_items`
- `toolkit_resources`
- `toolkit_resource_items`
- `simulator_scenarios`
- `simulator_goals`
- `simulator_nodes`
- `simulator_options`
- `tags`
- `scenario_tags`

## 当前默认行为

- 未登录：全部内容可读，本地保存收藏、进度、最近学习、onboarding 状态
- 已登录：邮箱魔法链接登录后，可把本地状态合并到 Supabase
- 无 Supabase：`/login` 会给出本地模式提示，不会报错
- 深色模式：支持系统 / 浅色 / 深色切换
- PWA：已包含 `manifest.ts` 和应用图标，可继续补 service worker 做更完整离线缓存

## 测试与验收

当前重点覆盖：

- 搜索排序与分类过滤
- 本地 / 远端进度合并
- 学习路径与模拟器种子完整性
- 构建、Lint 与页面主路径打通

建议在提交前至少执行：

```bash
npm run lint
npm run test:run
npm run build
npm run smoke:routes
```

Supabase 鐪熷疄鐜鑱旇皟娓呭崟锛歚docs/supabase-cloud-checklist.md`

`npm run smoke:routes` 会复用当前 `.next` 生产构建产物，所以要先成功跑过一次 `npm run build`。

## 后续扩展建议

- 把 `seed.ts` 的内容迁移到 Supabase 内容表，做内容管理后台
- 为工具箱补真正的下载文件导出（PDF / TXT）
- 为模拟器增加更多目标分支和“更稳妥说法”评分
- 增加服务工作线程缓存，完善离线阅读
- 接入勋章体系、连续学习反馈和更细粒度的路线推荐
- 增加内容审核 / 更新日期 / 来源标注，进一步增强“信息靠谱”感
