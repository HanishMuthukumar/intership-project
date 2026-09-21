-- ==============================================================================
-- WWE LIVE QUIZ ARENA — COMPLETE SUPABASE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/ckibvzxicpvtrojtalqw)
-- ==============================================================================

-- ── 1. Enable Vector Extension for AI Embeddings ─────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 2. Reset Tables (Clean Slate) ───────────────────────────────────────────
DROP TABLE IF EXISTS solution_votes CASCADE;
DROP TABLE IF EXISTS solutions CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP FUNCTION IF EXISTS match_questions(vector, float, int);

-- ── 3. Questions Table ───────────────────────────────────────────────────────
CREATE TABLE questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body        TEXT NOT NULL,
  author      TEXT DEFAULT 'Challenger',
  tags        TEXT[] DEFAULT ARRAY['General'],
  embedding   vector(768),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Full-Text Search GIN index for keyword queries
CREATE INDEX questions_fts_idx ON questions USING gin (to_tsvector('english', body));

-- ── 4. Question Votes Table ──────────────────────────────────────────────────
CREATE TABLE votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  voter_id     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (question_id, voter_id)
);

CREATE INDEX votes_question_id_idx ON votes (question_id);

-- ── 5. Solutions Table (Poll Answers) ────────────────────────────────────────
CREATE TABLE solutions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  body         TEXT NOT NULL,
  author       TEXT,
  is_accepted  BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX solutions_question_id_idx ON solutions (question_id);

-- ── 6. Solution Votes Table (Votes on Poll Answers) ──────────────────────────
CREATE TABLE solution_votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id  UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  voter_id     TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (solution_id, voter_id)
);

CREATE INDEX solution_votes_solution_id_idx ON solution_votes (solution_id);

-- ── 7. Vector Similarity Search Function (RPC) ───────────────────────────────
CREATE OR REPLACE FUNCTION match_questions (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  body text,
  author text,
  tags text[],
  similarity float,
  votes int
)
LANGUAGE sql STABLE
AS $$
  SELECT
    questions.id,
    questions.body,
    questions.author,
    questions.tags,
    1 - (questions.embedding <=> query_embedding) AS similarity,
    COALESCE((SELECT COUNT(*)::int FROM votes WHERE votes.question_id = questions.id), 0)::int AS votes
  FROM questions
  WHERE questions.embedding IS NOT NULL AND 1 - (questions.embedding <=> query_embedding) > match_threshold
  ORDER BY questions.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ── 8. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on questions" ON questions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select on votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on votes" ON votes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select on solutions" ON solutions FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on solutions" ON solutions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select on solution_votes" ON solution_votes FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on solution_votes" ON solution_votes FOR ALL USING (true) WITH CHECK (true);

