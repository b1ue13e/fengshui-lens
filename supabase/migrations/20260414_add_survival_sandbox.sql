create extension if not exists vector;

create table if not exists public.knowledge_sources (
  id text primary key,
  title text not null,
  publisher text not null,
  url text not null unique,
  source_type text not null check (source_type in ('policy', 'service_guide', 'faq', 'law', 'news')),
  city text not null,
  published_at date not null,
  effective_at date,
  reviewed_at date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_documents (
  id text primary key,
  source_id text not null references public.knowledge_sources(id) on delete cascade,
  title text not null,
  summary text not null,
  city_tags text[] not null default '{}',
  persona_tags text[] not null default '{}',
  topic_tags text[] not null default '{}',
  version_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.knowledge_chunks (
  id text primary key,
  document_id text not null references public.knowledge_documents(id) on delete cascade,
  title text not null,
  content text not null,
  why_it_matters text not null,
  actions jsonb not null default '[]'::jsonb,
  required_materials jsonb not null default '[]'::jsonb,
  deadline_or_trigger text not null,
  topic_tags text[] not null default '{}',
  stage_ids text[] not null default '{}',
  city_tags text[] not null default '{}',
  persona_tags text[] not null default '{}',
  keywords text[] not null default '{}',
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  verification_required boolean not null default false,
  priority integer not null default 0,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.route_plans (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_city text not null,
  persona text not null,
  knowledge_version text not null,
  input_json jsonb not null,
  plan_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_knowledge_sources_city on public.knowledge_sources(city);
create index if not exists idx_knowledge_documents_source on public.knowledge_documents(source_id);
create index if not exists idx_knowledge_documents_tags on public.knowledge_documents using gin(topic_tags);
create index if not exists idx_knowledge_chunks_document on public.knowledge_chunks(document_id);
create index if not exists idx_knowledge_chunks_stage_ids on public.knowledge_chunks using gin(stage_ids);
create index if not exists idx_knowledge_chunks_topic_tags on public.knowledge_chunks using gin(topic_tags);
create index if not exists idx_knowledge_chunks_city_tags on public.knowledge_chunks using gin(city_tags);
create index if not exists idx_knowledge_chunks_persona_tags on public.knowledge_chunks using gin(persona_tags);
create index if not exists idx_route_plans_user on public.route_plans(user_id, created_at desc);

drop trigger if exists knowledge_sources_set_updated_at on public.knowledge_sources;
create trigger knowledge_sources_set_updated_at before update on public.knowledge_sources for each row execute procedure public.set_updated_at();
drop trigger if exists knowledge_documents_set_updated_at on public.knowledge_documents;
create trigger knowledge_documents_set_updated_at before update on public.knowledge_documents for each row execute procedure public.set_updated_at();
drop trigger if exists knowledge_chunks_set_updated_at on public.knowledge_chunks;
create trigger knowledge_chunks_set_updated_at before update on public.knowledge_chunks for each row execute procedure public.set_updated_at();
drop trigger if exists route_plans_set_updated_at on public.route_plans;
create trigger route_plans_set_updated_at before update on public.route_plans for each row execute procedure public.set_updated_at();

alter table public.knowledge_sources enable row level security;
alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.route_plans enable row level security;

drop policy if exists "public can read knowledge_sources" on public.knowledge_sources;
create policy "public can read knowledge_sources" on public.knowledge_sources for select using (true);
drop policy if exists "public can read knowledge_documents" on public.knowledge_documents;
create policy "public can read knowledge_documents" on public.knowledge_documents for select using (true);
drop policy if exists "public can read knowledge_chunks" on public.knowledge_chunks;
create policy "public can read knowledge_chunks" on public.knowledge_chunks for select using (true);

drop policy if exists "users manage own route_plans" on public.route_plans;
create policy "users manage own route_plans" on public.route_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
