create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  icon text not null,
  description text not null,
  accent text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id text primary key,
  category_id text not null references public.categories(id) on delete restrict,
  title text not null,
  slug text not null unique,
  summary text not null,
  one_liner text not null,
  target_users text[] not null default '{}',
  target_stage text[] not null default '{}',
  difficulty text not null check (difficulty in ('easy', 'standard', 'watchout')),
  estimated_minutes integer not null default 5,
  cover_image text,
  cover_style text not null default 'peach',
  is_featured boolean not null default false,
  starter_priority integer not null default 0,
  popularity_score integer not null default 0,
  emergency_level integer not null default 0 check (emergency_level between 0 and 3),
  aliases text[] not null default '{}',
  keywords text[] not null default '{}',
  tags text[] not null default '{}',
  related_scenario_slugs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenario_sections (
  id text primary key,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  section_type text not null check (section_type in ('intro', 'preparation', 'steps', 'pitfalls', 'faq', 'scripts', 'checklist', 'quiz')),
  title text not null,
  content jsonb not null,
  sort_order integer not null default 0
);

create table if not exists public.scenario_checklists (
  id text primary key,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  title text not null
);

create table if not exists public.scenario_checklist_items (
  id text primary key,
  checklist_id text not null references public.scenario_checklists(id) on delete cascade,
  content text not null,
  checked_default boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.scenario_faqs (
  id text primary key,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order integer not null default 0
);

create table if not exists public.scenario_scripts (
  id text primary key,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  script_type text not null check (script_type in ('opening', 'followup', 'complaint', 'negotiation')),
  title text not null,
  content text not null,
  sort_order integer not null default 0
);

create table if not exists public.scenario_quizzes (
  id text primary key,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer integer not null,
  explanation text not null,
  sort_order integer not null default 0
);

create table if not exists public.learning_paths (
  id text primary key,
  title text not null,
  slug text not null unique,
  description text not null,
  cover text not null,
  target_stage text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_path_items (
  id text primary key,
  learning_path_id text not null references public.learning_paths(id) on delete cascade,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  sort_order integer not null default 0,
  unique (learning_path_id, scenario_id)
);

create table if not exists public.toolkit_resources (
  id text primary key,
  category_id text references public.categories(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null,
  related_scenario_slug text,
  download_name text not null,
  copy_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.toolkit_resource_items (
  id text primary key,
  toolkit_resource_id text not null references public.toolkit_resources(id) on delete cascade,
  content text not null,
  sort_order integer not null default 0
);

create table if not exists public.simulator_scenarios (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null,
  related_scenario_slug text
);

create table if not exists public.simulator_goals (
  id text primary key,
  simulator_scenario_id text not null references public.simulator_scenarios(id) on delete cascade,
  label text not null,
  opening_line text not null,
  success_line text not null,
  sort_order integer not null default 0
);

create table if not exists public.simulator_nodes (
  id text primary key,
  simulator_scenario_id text not null references public.simulator_scenarios(id) on delete cascade,
  speaker text not null check (speaker in ('system', 'other')),
  title text not null,
  message text not null,
  sort_order integer not null default 0
);

create table if not exists public.simulator_options (
  id text primary key,
  simulator_node_id text not null references public.simulator_nodes(id) on delete cascade,
  next_node_id text references public.simulator_nodes(id) on delete set null,
  label text not null,
  feedback text not null,
  tone text not null check (tone in ('good', 'okay', 'risky')),
  append_to_script text,
  sort_order integer not null default 0
);

create table if not exists public.tags (
  id text primary key,
  label text not null,
  slug text not null unique
);

create table if not exists public.scenario_tags (
  scenario_id text not null references public.scenarios(id) on delete cascade,
  tag_id text not null references public.tags(id) on delete cascade,
  primary key (scenario_id, tag_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  preferred_theme text not null default 'system' check (preferred_theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorites text[] not null default '{}',
  completed text[] not null default '{}',
  recent text[] not null default '{}',
  saved_toolkits text[] not null default '{}',
  onboarding_stage text,
  checklist_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_scenario_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id text not null references public.scenarios(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  saved boolean not null default false,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, scenario_id)
);

create table if not exists public.user_path_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_path_id text not null references public.learning_paths(id) on delete cascade,
  completed_count integer not null default 0,
  progress_percent numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, learning_path_id)
);

create table if not exists public.user_toolkit_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  toolkit_resource_id text not null references public.toolkit_resources(id) on delete cascade,
  saved boolean not null default false,
  copied_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, toolkit_resource_id)
);

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  message text not null,
  page text,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_sort_order on public.categories(sort_order);
create index if not exists idx_scenarios_category_id on public.scenarios(category_id);
create index if not exists idx_scenarios_slug on public.scenarios(slug);
create index if not exists idx_scenarios_featured on public.scenarios(is_featured, starter_priority desc, popularity_score desc);
create index if not exists idx_learning_paths_sort_order on public.learning_paths(sort_order);
create index if not exists idx_toolkit_resources_slug on public.toolkit_resources(slug);
create index if not exists idx_simulator_scenarios_slug on public.simulator_scenarios(slug);
create index if not exists idx_feedback_submissions_created_at on public.feedback_submissions(created_at desc);

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
drop trigger if exists scenarios_set_updated_at on public.scenarios;
create trigger scenarios_set_updated_at before update on public.scenarios for each row execute procedure public.set_updated_at();
drop trigger if exists learning_paths_set_updated_at on public.learning_paths;
create trigger learning_paths_set_updated_at before update on public.learning_paths for each row execute procedure public.set_updated_at();
drop trigger if exists toolkit_resources_set_updated_at on public.toolkit_resources;
create trigger toolkit_resources_set_updated_at before update on public.toolkit_resources for each row execute procedure public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at before update on public.user_preferences for each row execute procedure public.set_updated_at();
drop trigger if exists user_scenario_states_set_updated_at on public.user_scenario_states;
create trigger user_scenario_states_set_updated_at before update on public.user_scenario_states for each row execute procedure public.set_updated_at();
drop trigger if exists user_path_states_set_updated_at on public.user_path_states;
create trigger user_path_states_set_updated_at before update on public.user_path_states for each row execute procedure public.set_updated_at();
drop trigger if exists user_toolkit_states_set_updated_at on public.user_toolkit_states;
create trigger user_toolkit_states_set_updated_at before update on public.user_toolkit_states for each row execute procedure public.set_updated_at();

alter table public.categories enable row level security;
alter table public.scenarios enable row level security;
alter table public.scenario_sections enable row level security;
alter table public.scenario_checklists enable row level security;
alter table public.scenario_checklist_items enable row level security;
alter table public.scenario_faqs enable row level security;
alter table public.scenario_scripts enable row level security;
alter table public.scenario_quizzes enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_items enable row level security;
alter table public.toolkit_resources enable row level security;
alter table public.toolkit_resource_items enable row level security;
alter table public.simulator_scenarios enable row level security;
alter table public.simulator_goals enable row level security;
alter table public.simulator_nodes enable row level security;
alter table public.simulator_options enable row level security;
alter table public.tags enable row level security;
alter table public.scenario_tags enable row level security;
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_scenario_states enable row level security;
alter table public.user_path_states enable row level security;
alter table public.user_toolkit_states enable row level security;
alter table public.feedback_submissions enable row level security;

drop policy if exists "public can read categories" on public.categories;
create policy "public can read categories" on public.categories for select using (true);
drop policy if exists "public can read scenarios" on public.scenarios;
create policy "public can read scenarios" on public.scenarios for select using (true);
drop policy if exists "public can read scenario_sections" on public.scenario_sections;
create policy "public can read scenario_sections" on public.scenario_sections for select using (true);
drop policy if exists "public can read scenario_checklists" on public.scenario_checklists;
create policy "public can read scenario_checklists" on public.scenario_checklists for select using (true);
drop policy if exists "public can read scenario_checklist_items" on public.scenario_checklist_items;
create policy "public can read scenario_checklist_items" on public.scenario_checklist_items for select using (true);
drop policy if exists "public can read scenario_faqs" on public.scenario_faqs;
create policy "public can read scenario_faqs" on public.scenario_faqs for select using (true);
drop policy if exists "public can read scenario_scripts" on public.scenario_scripts;
create policy "public can read scenario_scripts" on public.scenario_scripts for select using (true);
drop policy if exists "public can read scenario_quizzes" on public.scenario_quizzes;
create policy "public can read scenario_quizzes" on public.scenario_quizzes for select using (true);
drop policy if exists "public can read learning_paths" on public.learning_paths;
create policy "public can read learning_paths" on public.learning_paths for select using (true);
drop policy if exists "public can read learning_path_items" on public.learning_path_items;
create policy "public can read learning_path_items" on public.learning_path_items for select using (true);
drop policy if exists "public can read toolkit_resources" on public.toolkit_resources;
create policy "public can read toolkit_resources" on public.toolkit_resources for select using (true);
drop policy if exists "public can read toolkit_resource_items" on public.toolkit_resource_items;
create policy "public can read toolkit_resource_items" on public.toolkit_resource_items for select using (true);
drop policy if exists "public can read simulator_scenarios" on public.simulator_scenarios;
create policy "public can read simulator_scenarios" on public.simulator_scenarios for select using (true);
drop policy if exists "public can read simulator_goals" on public.simulator_goals;
create policy "public can read simulator_goals" on public.simulator_goals for select using (true);
drop policy if exists "public can read simulator_nodes" on public.simulator_nodes;
create policy "public can read simulator_nodes" on public.simulator_nodes for select using (true);
drop policy if exists "public can read simulator_options" on public.simulator_options;
create policy "public can read simulator_options" on public.simulator_options for select using (true);
drop policy if exists "public can read tags" on public.tags;
create policy "public can read tags" on public.tags for select using (true);
drop policy if exists "public can read scenario_tags" on public.scenario_tags;
create policy "public can read scenario_tags" on public.scenario_tags for select using (true);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "users manage own preferences" on public.user_preferences;
create policy "users manage own preferences" on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users manage own scenario states" on public.user_scenario_states;
create policy "users manage own scenario states" on public.user_scenario_states for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users manage own path states" on public.user_path_states;
create policy "users manage own path states" on public.user_path_states for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "users manage own toolkit states" on public.user_toolkit_states;
create policy "users manage own toolkit states" on public.user_toolkit_states for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "anyone can submit feedback" on public.feedback_submissions;
create policy "anyone can submit feedback" on public.feedback_submissions for insert with check (true);
drop policy if exists "users can read own feedback" on public.feedback_submissions;
create policy "users can read own feedback" on public.feedback_submissions for select using (auth.uid() = user_id);
