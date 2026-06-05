-- Polling system schema — run this in the Supabase SQL Editor.
-- Each question can have multiple solution options. Users can vote on solutions.

-- ── solutions (poll options for questions) ────────────────────────────────────
create table if not exists solutions (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions(id) on delete cascade,
  body         text not null,
  author       text,
  created_at   timestamptz default now()
);

create index solutions_question_id_idx on solutions (question_id);

-- ── solution_votes ───────────────────────────────────────────────────────────
-- one row per vote; unique constraint enforces one vote per voter per solution.
create table if not exists solution_votes (
  id            uuid primary key default gen_random_uuid(),
  solution_id   uuid not null references solutions(id) on delete cascade,
  voter_id      text not null,
  created_at    timestamptz default now(),
  unique (solution_id, voter_id)
);

create index solution_votes_solution_id_idx on solution_votes (solution_id);

-- ── Enable public access (no RLS for now) ────────────────────────────────────
alter table solutions enable row level security;
alter table solution_votes enable row level security;

-- Allow all operations for service role (our server uses service role key)
create policy "Service role full access" on solutions for all using (true) with check (true);
create policy "Service role full access" on solution_votes for all using (true) with check (true);

-- ── Seed some solutions for existing questions ───────────────────────────────
-- Add sample solutions to the first few questions so the UI shows polls
do $$
declare
  q_id uuid;
begin
  -- Get first question
  select id into q_id from questions order by created_at desc limit 1;
  if q_id is not null then
    insert into solutions (question_id, body, author) values
      (q_id, 'Use Vercel CLI: vercel --prod', 'Alex'),
      (q_id, 'Push to GitHub and connect Vercel to the repo', 'Jordan'),
      (q_id, 'Use the Vercel dashboard import feature', 'Casey');
  end if;

  -- Get second question
  select id into q_id from questions order by created_at desc offset 1 limit 1;
  if q_id is not null then
    insert into solutions (question_id, body, author) values
      (q_id, 'Server components run on the server and can access databases directly', 'Riley'),
      (q_id, 'Client components use "use client" directive and run in the browser', 'Morgan');
  end if;

  -- Get third question
  select id into q_id from questions order by created_at desc offset 2 limit 1;
  if q_id is not null then
    insert into solutions (question_id, body, author) values
      (q_id, 'Add indexes on columns used in WHERE clauses and JOIN conditions', 'Taylor'),
      (q_id, 'Use EXPLAIN ANALYZE to identify slow queries first', 'Quinn'),
      (q_id, 'Start without indexes, add them when queries become slow', 'Avery');
  end if;
end $$;
