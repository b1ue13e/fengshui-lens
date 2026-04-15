# Survival Sandbox V1

This document describes the Shanghai fresh-graduate survival sandbox added in April 2026.

## Product scope

- Homepage narrative changes from a static guide hub to a route-plan wizard.
- V1 supports one audited scenario only: `Shanghai x fresh_graduate`.
- Policy-facing output must include citations, city scope, and `reviewedAt`.
- Unsupported cities fall back to a clearly labeled generic response instead of pretending to be tailored.

## Main user flow

1. User lands on `/`.
2. The wizard collects:
   - `originCity`
   - `graduationDate`
   - `offerStatus`
   - `arrivalWindow`
   - `housingBudget`
   - `hukouInterest`
   - `currentHousingStatus`
3. The app calls `POST /api/survival-plans`.
4. The generated plan is saved locally for guest reopen and, when possible, synced to Supabase.
5. The result is rendered at `/survival-plans/[id]`.

## API surface

- `POST /api/survival-plans`
  - Input: `RouteWizardInput`
  - Output: `{ planId, plan }`
- `GET /api/survival-plans/[id]`
  - Reopens a previously generated plan for the signed-in owner

Core types live in `lib/types/survival-sandbox.ts`.

## Knowledge system

Knowledge content is stored in repo-first files and can be exported to Supabase.

- Local seed: `lib/content/survival-sandbox.ts`
- Retrieval and planning: `lib/survival/*`
- Migration: `supabase/migrations/20260414_add_survival_sandbox.sql`

Auditable tables:

- `knowledge_sources`
- `knowledge_documents`
- `knowledge_chunks`
- `route_plans`

## Seed export

Generate the survival knowledge seed with:

```bash
npm run seed:survival
```

This writes:

```text
supabase/seeds/survival-sandbox.seed.json
```

The export payload contains source metadata, document metadata, and chunk rows ready for manual import.

## Verification

Implemented verification for V1:

- retrieval filtering unit tests
- plan assembly citation + fallback unit tests
- knowledge export integrity unit tests
- local guest storage unit tests
- production build
- route smoke check for `/`, `/categories`, `/toolkit`, `/simulator`, `/rent/tools`
