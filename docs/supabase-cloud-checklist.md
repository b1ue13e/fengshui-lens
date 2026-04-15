# Supabase Cloud Validation Checklist

Use this checklist when the app is connected to a real Supabase project and you want to validate the full cloud path, not just local smoke coverage.

This checklist covers:

- Email Magic Link sign-in
- Local progress merge into Supabase
- Remote content and remote knowledge base reads
- Per-user isolation for `route_plans`
- Basic RLS sanity checks

`docs/smoke-checklist.md` is still the right place for routine local regression checks. This document is specifically for real-environment Supabase validation.

## 1. Prerequisites

### 1.1 Local environment

Create `.env.local` with at least:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_CONTENT_SOURCE=local
ENABLE_INTERNAL_PAGES=false
```

Recommended rollout:

1. Start with `SUPABASE_CONTENT_SOURCE=local` to validate auth, progress sync, feedback, and `route_plans`.
2. Switch to `SUPABASE_CONTENT_SOURCE=remote` only after the database is seeded and you are ready to validate remote content and remote knowledge.

### 1.2 Supabase dashboard configuration

In Supabase Dashboard, verify:

- `Authentication -> Providers -> Email` is enabled.
- `Authentication -> URL Configuration -> Site URL` matches `NEXT_PUBLIC_APP_URL`.
- `Authentication -> URL Configuration -> Redirect URLs` includes:
  - `http://localhost:3000/auth/callback`
  - your preview callback URL
  - your production callback URL

If this is misconfigured, the most common symptoms are:

- login emails are sent but return to the wrong site
- `/login?login=success` never appears
- the callback cannot establish a session with `exchangeCodeForSession`

### 1.3 Database migrations

Apply both migrations:

- `supabase/migrations/20260414_init_young_study.sql`
- `supabase/migrations/20260414_add_survival_sandbox.sql`

If you use the Supabase CLI:

```bash
supabase db push
```

### 1.4 Seed data

If you want to validate remote content and remote knowledge, generate both seeds:

```bash
npm run seed:export
npm run seed:survival
```

This produces:

- `supabase/seeds/young-study.seed.json`
- `supabase/seeds/survival-sandbox.seed.json`

Import targets:

- `young-study.seed.json`
  - `categories`
  - `scenarios`
  - `scenario_sections`
  - `learning_paths`
  - `toolkit_resources`
  - `simulator_*`
- `survival-sandbox.seed.json`
  - `knowledge_sources`
  - `knowledge_documents`
  - `knowledge_chunks`

If you only need auth, progress sync, feedback, and `route_plans`, you can skip remote content import for the first pass and keep `SUPABASE_CONTENT_SOURCE=local`.

## 2. Quick SQL sanity checks

Before running the app, check that the base tables are populated:

```sql
select count(*) as categories from public.categories;
select count(*) as scenarios from public.scenarios;
select count(*) as knowledge_sources from public.knowledge_sources;
select count(*) as knowledge_documents from public.knowledge_documents;
select count(*) as knowledge_chunks from public.knowledge_chunks;
```

Useful observation queries during validation:

```sql
select * from public.user_preferences order by updated_at desc limit 5;
select * from public.feedback_submissions order by created_at desc limit 5;
select * from public.route_plans order by updated_at desc limit 5;
```

## 3. Auth and callback validation

### 3.1 Magic Link sign-in

1. Open `http://localhost:3000/login`.
2. Confirm the page shows the email input instead of local demo mode.
3. Send a Magic Link to a real test inbox.
4. Click the email link.
5. Confirm the app lands on `/login?login=success` and then transitions into the signed-in state, usually `/profile`.

Expected result:

- no 500 errors
- no redirect to the wrong domain
- a matching user exists in `auth.users`

### 3.2 Callback safety

Open this URL directly:

```text
/auth/callback?next=//evil.example/phish
```

Expected result:

- it redirects to `/profile?login=success`
- it does not redirect to `evil.example`

## 4. Local progress merge into Supabase

This validates `public.user_preferences` plus the local Zustand snapshot merge flow.

1. Stay signed out.
2. Create some local state:
   - favorite one scenario
   - complete one scenario
   - build up recent views
3. Sign in through `/login`.
4. Let the app redirect into the signed-in state.
5. Refresh once, sign out, then sign back in.

Expected result:

- a row exists in `public.user_preferences` for the current user
- `favorites`, `completed`, `recent`, `saved_toolkits`, and `checklist_state` are persisted
- after signing back in, the state rehydrates from Supabase

Suggested verification query:

```sql
select
  user_id,
  favorites,
  completed,
  recent,
  saved_toolkits,
  checklist_state,
  updated_at
from public.user_preferences
order by updated_at desc
limit 5;
```

## 5. Feedback submission validation

1. Submit feedback while signed out.
2. Submit feedback again while signed in.

Expected result:

- new rows appear in `public.feedback_submissions`
- signed-out submissions may have `user_id = null`
- signed-in submissions carry the current `user_id`

## 6. `route_plans` validation

This validates:

- write path into `public.route_plans`
- reload path from Supabase
- cross-account isolation

### 6.1 Generate and reload under the same account

1. Sign in as account A.
2. Use the home-page route wizard to generate a plan.
3. Record the `planId` from the URL.
4. Refresh the page.
5. Open `/survival-plans/{planId}` in a new tab.

Expected result:

- the plan renders again after refresh
- the matching row in `public.route_plans` belongs to account A

Suggested verification query:

```sql
select
  id,
  user_id,
  target_city,
  persona,
  knowledge_version,
  updated_at
from public.route_plans
order by updated_at desc
limit 10;
```

### 6.2 Cross-account isolation

1. Keep the `planId` created by account A.
2. Sign out, or use an incognito window to sign in as account B.
3. Visit:
   - `/api/survival-plans/{planId}`
   - `/survival-plans/{planId}`

Expected result:

- the API returns `404`
- account B cannot load account A's cloud plan

This is one of the highest-priority security checks in the whole validation pass.

## 7. Remote content validation

After importing remote content and knowledge rows, switch:

```bash
SUPABASE_CONTENT_SOURCE=remote
```

Then verify:

1. `/categories` opens normally
2. `/search` works without errors
3. `/scenario/how-to-rent-house` renders correctly
4. the home-page route wizard still generates a plan with `supportingSources`

The most reliable manual confirmation is:

1. change one `scenarios.title` value in Supabase
2. refresh the matching page in the app
3. confirm the UI shows the remote title, not the local seed title

Important note:

- if `knowledge_*` is missing or incomplete, the current implementation falls back to the local knowledge base instead of hard failing
- seeing a route plan is not enough to prove remote knowledge is active; also verify the `knowledge_*` tables actually contain data

## 8. RLS spot checks

Current migration intent:

- public read access:
  - `categories`
  - `scenarios`
  - `scenario_*`
  - `learning_paths`
  - `toolkit_*`
  - `simulator_*`
  - `knowledge_*`
- per-user access only:
  - `profiles`
  - `user_preferences`
  - `user_scenario_states`
  - `user_path_states`
  - `user_toolkit_states`
  - `route_plans`
- feedback:
  - `feedback_submissions` allows `insert` for anyone
  - signed-in users can `select` their own feedback rows

If any of the following happen, investigate migrations and policies before blaming the frontend:

- a signed-out session can read someone else's `route_plans`
- account B can read account A's `user_preferences`
- public content becomes `401` or `403` after switching to `SUPABASE_CONTENT_SOURCE=remote`

## 9. Pass criteria

Treat the Supabase validation run as passed when all of the following are true:

- `/login` works with a real Supabase project
- the callback establishes a session and reaches `/login?login=success`
- local progress persists and reloads through `user_preferences`
- feedback writes succeed
- `route_plans` writes, reloads, and stays isolated per account
- remote content and remote knowledge are readable with `SUPABASE_CONTENT_SOURCE=remote`
- `/auth/callback?next=//evil.example/phish` does not open-redirect

## 10. Suggested run log

For each real-environment validation run, record:

- Supabase project id
- app URL
- current `SUPABASE_CONTENT_SOURCE`
- test email
- latest `user_preferences.updated_at`
- latest `route_plans.id`
- whether cross-account `404` was validated
- whether remote content and remote knowledge were validated
