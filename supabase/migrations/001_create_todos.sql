create extension if not exists "pgcrypto";

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  created_at timestamptz not null default now(),
  completed boolean not null default false,
  completed_at timestamptz
);

create index if not exists todos_user_id_created_at_idx
  on public.todos (user_id, created_at desc);

create index if not exists todos_user_id_completed_created_at_idx
  on public.todos (user_id, completed, created_at desc);

alter table public.todos enable row level security;

create policy "Users can view their own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

create policy "Users can create their own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on public.todos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);
