# 青年大学习 Smoke Checklist

这份清单用于验证当前默认主线是否仍然是“青年大学习”而不是旧租房工具壳。

## 环境前提

- 未配置 Supabase 也应能完成主流程演示
- 生产环境默认隐藏 `/design` 与 `/dev/*`
- 提交前至少跑一次：
  - `npm run lint`
  - `npm run test:run`
  - `npm run build`

## 主导航

- 打开 `/`
  - 顶部品牌为“青年大学习”
  - 可以看到搜索入口和“紧急”入口
  - 首页首次进入会出现 onboarding 选择层，允许跳过
- 在移动端底部导航检查：
  - `/`
  - `/categories`
  - `/paths`
  - `/toolkit`
  - `/simulator`
  - `/profile`

## 发现与内容

- 打开 `/search`
  - 能看到搜索输入框和分类筛选
  - 搜不到内容时出现空状态，不报错
- 打开 `/categories`
  - 能看到 9 个主分类卡片
- 打开一个分类详情页，例如 `/categories/housing`
  - 能看到分类头图和对应场景列表
- 打开一个场景详情页，例如 `/scenario/how-to-rent-house`
  - 能看到步骤、FAQ、话术、清单、自测等内容
- 点击紧急入口 `/scenario/call-police`
  - 页面能正常打开，不出现 404

## 学习路径与工具

- 打开 `/paths`
  - 路线卡可正常展示
  - 进度条不报错
- 打开 `/toolkit`
  - 工具模板列表可正常显示
- 打开 `/simulator`
  - 至少能选择一个模拟场景并进入对话流程

## 个人中心与登录

- 打开 `/profile`
  - 最近学习、收藏、学习路径、工具收藏、反馈模块可见
- 打开 `/login`
  - 未配置 Supabase 时显示“本地演示模式”
  - 已配置 Supabase 时应出现邮箱输入与登录入口
  - 不应出现服务端报错或空白页
- 访问 `/auth/callback?next=/login`
  - 应重定向回 `/login?login=success`
  - 不应出现 500 或卡住

## 云端模式补充

- 真实 Supabase 环境下，还应额外人工验证：
  - `/login` 渲染邮箱输入与发送登录链接按钮
  - 邮件 OTP 回来后能进入已登录态
  - 本地收藏 / 完成 / 最近学习能合并到云端
- 当前自动 smoke 只覆盖：
  - 路由可访问性
  - `/login` 页面模式识别
  - `/auth/callback` 的重定向行为

## 租房专区

- 打开 `/rent/tools`
  - 明确显示其是“青年大学习”里的租房专区，不像独立旧产品
- 打开 `/rent/tools/evaluate`
  - 表单可正常渲染，能进入下一步
- 打开 `/rent/tools/analyze`
  - 目标选择与链接输入框可正常显示
- 打开 `/rent/tools/compare`
  - 示例对比内容可正常渲染
- 打开 `/rent/tools/report`
  - 示例判断卡可正常显示
- 打开 `/rent/tools/result`
  - 即使没有本地存储，也会回退到示例数据页

## 内部页保护

- 生产环境默认访问这些路径应不可见：
  - `/design`
  - `/dev/cases`
  - `/dev/metrics`

鐪熷疄 Supabase 椤圭洰鐨勮缁嗚仈璋冩竻鍗曡瑙侊細`docs/supabase-cloud-checklist.md`
- 如果显式设置 `ENABLE_INTERNAL_PAGES=true`，上述路径才应重新开放

## 收口通过标准

- 默认入口、品牌文案、导航全部服务“青年大学习”
- 租房能力以“租房专区”身份存在，而不是旧产品主壳
- 未配 Supabase 时，核心路径可完整演示
- `lint`、`test`、`build` 全绿
