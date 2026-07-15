-- 活動回饋 / 評論表
create extension if not exists pgcrypto;

create table if not exists event_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  reviewer_name text not null,
  content text not null check (char_length(content) <= 200),
  created_at timestamptz default now()
);

create index if not exists event_reviews_event_id_idx on event_reviews (event_id);
create index if not exists event_reviews_created_at_idx on event_reviews (created_at desc);

alter table event_reviews enable row level security;

drop policy if exists "anyone can read" on event_reviews;
create policy "anyone can read" on event_reviews
  for select
  using (true);

drop policy if exists "anyone can insert" on event_reviews;
create policy "anyone can insert" on event_reviews
  for insert
  with check (true);
