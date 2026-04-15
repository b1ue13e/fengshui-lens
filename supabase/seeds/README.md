# Supabase Seed Notes

青年大学习 MVP 默认直接使用 `lib/content/seed.ts` 作为本地内容源，因此本地开发不需要先往 Supabase 灌内容。

如果你准备把内容迁到 Supabase，可以按这个顺序做：

## 1. 先执行初始化 SQL

把 `supabase/migrations/20260414_init_young_study.sql` 应用到你的 Supabase 项目。

如果你装了 Supabase CLI，可以使用：

```bash
supabase db push
```

## 2. 导出当前本地种子

```bash
npm run seed:export
```

执行后会生成：

```text
supabase/seeds/young-study.seed.json
```

## 3. 将 JSON 导入到内容表

导出的 JSON 采用按表拆分的结构，顶层为：

- `counts`
- `tables`

其中 `tables` 包含：

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

你可以：

- 用后台脚本逐表 upsert
- 用 SQL / Edge Function 做一次性导入
- 先导入内容表，再把 `SUPABASE_CONTENT_SOURCE` 切换成 `remote`

## 4. 用户数据说明

用户侧数据不需要手工种子：

- `profiles`
- `user_preferences`
- `user_scenario_states`
- `user_path_states`
- `user_toolkit_states`
- `feedback_submissions`

濡傛灉杩樿鍚屾椂楠岃瘉鐧诲綍銆佽繘搴﹀悓姝ャ€?`route_plans` 鍜岃法璐﹀彿闅旂锛岃鍚屾椂瀵圭収锛歚docs/supabase-cloud-checklist.md`

这些表会在真实用户使用过程中自然生成。
