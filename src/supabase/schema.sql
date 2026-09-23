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

-- ── 9. Seed 20 WWE Quiz Questions with Official Categories ───────────────────
INSERT INTO questions (body, author, tags, created_at)
SELECT body, author, tags, now() - (n || ' minutes')::interval
FROM (
  VALUES
    (1,  'Who is known as ''The Deadman'' in WWE?', 'QuizMaster', ARRAY['Legends']),
    (2,  'Which WWE superstar has won the most Royal Rumble matches?', 'WWEFan', ARRAY['Royal Rumble', 'Legends']),
    (3,  'In which year did The Rock win his first WWE Championship?', 'RockFan', ARRAY['Champions', 'Legends']),
    (4,  'What is the name of John Cena''s finishing move?', 'CenaFan', ARRAY['Legends', 'General']),
    (5,  'Which tag team is known as ''The Brothers of Destruction''?', 'TagTeamFan', ARRAY['Tag Teams', 'Legends']),
    (6,  'Who was the first-ever Universal Champion?', 'UniversalFan', ARRAY['Champions']),
    (7,  'At which WrestleMania did The Undertaker lose his undefeated streak?', 'StreakFan', ARRAY['WrestleMania', 'Legends']),
    (8,  'Which superstar goes by the nickname ''The Beast Incarnate''?', 'BeastFan', ARRAY['Champions', 'Legends']),
    (9,  'What is the signature submission move of Chris Jericho?', 'JerichoFan', ARRAY['Legends', 'General']),
    (10, 'Who challenged The Undertaker at WrestleMania 28 in a ''Hell in a Cell'' match?', 'HBKFan', ARRAY['WrestleMania', 'Rivalries']),
    (11, 'Which PPV event features a 30-man Royal Rumble match annually?', 'PPVFan', ARRAY['PPV Events', 'Royal Rumble']),
    (12, 'How many times has Triple H won the WWE World Championship?', 'HHHFan', ARRAY['Champions', 'Legends']),
    (13, 'What is Roman Reigns'' famous battle cry catchphrase?', 'ReignsFan', ARRAY['Champions', 'General']),
    (14, 'Who was the original member of nWo alongside Hollywood Hogan and Scott Hall?', 'NWOFan', ARRAY['Legends', 'Rivalries']),
    (15, 'Which superstar is called ''The Phenomenal One''?', 'AJStylesFan', ARRAY['Champions', 'General']),
    (16, 'Who won the 2024 Men''s Royal Rumble match in WWE?', 'CodyRhodesFan', ARRAY['Royal Rumble', 'Champions']),
    (17, 'What was the faction name consisting of Roman Reigns, Seth Rollins, and Dean Ambrose?', 'ShieldFan', ARRAY['Tag Teams', 'Champions']),
    (18, 'Which WWE superstar is famously introduced as ''The Texas Rattlesnake''?', 'Austin316', ARRAY['Legends']),
    (19, 'At which WrestleMania did Shawn Michaels retire against The Undertaker in ''Streak vs Career''?', 'HBKRetire', ARRAY['WrestleMania', 'Legends']),
    (20, 'Who holds the record for the longest modern WWE Universal Championship reign at over 1,300 days?', 'TribalChief', ARRAY['Champions'])
) AS seed(n, body, author, tags);

-- ── 10. Seed Verified Answers (Solutions) for Questions ───────────────────────
DO $$
DECLARE
  q record;
BEGIN
  FOR q IN SELECT id, body FROM questions LOOP
    IF q.body ILIKE '%Deadman%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Undertaker debuted at Survivor Series 1990 and wrestled for over 30 years as The Deadman.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%most Royal Rumble%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Stone Cold Steve Austin holds the all-time record with 3 Royal Rumble match victories (1997, 1998, 2001).', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%The Rock win his first%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Rock won his first WWE Championship in 1998 at Survivor Series in the Deadly Games tournament.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%John Cena''s finishing move%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Attitude Adjustment (AA), formerly known as the FU, along with the STF submission move.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Brothers of Destruction%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Undertaker and Kane, managed by Paul Bearer.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%first-ever Universal Champion%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Finn Bálor became the inaugural WWE Universal Champion at SummerSlam 2016 by defeating Seth Rollins.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%streak%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'WrestleMania 30 (XXX) in 2014, where Brock Lesnar defeated The Undertaker, breaking the 21-0 streak.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Beast Incarnate%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Brock Lesnar, managed by advocate Paul Heyman.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Chris Jericho%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Walls of Jericho (elevated Boston Crab) and the Liontamer.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%WrestleMania 28%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Triple H faced The Undertaker inside Hell in a Cell with Shawn Michaels as the special referee.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%30-man Royal Rumble match annually%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Royal Rumble pay-per-view, held every January since 1988.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Triple H won%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Triple H is a 14-time WWE World Champion (9 WWE Championships, 5 World Heavyweight Championships).', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Roman Reigns'' famous battle cry%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, '''Acknowledge Me!'' is Roman Reigns'' famous catchphrase as The Tribal Chief.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%nWo%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Kevin Nash (Diesel) joined Scott Hall (Razor Ramon) and Hulk Hogan to form the original New World Order in 1996.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Phenomenal One%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'AJ Styles is known worldwide as The Phenomenal One.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%2024 Men''s Royal Rumble%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Cody Rhodes won the 2024 Men''s Royal Rumble from the #15 spot, last eliminating CM Punk.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Dean Ambrose%' OR q.body ILIKE '%Seth Rollins%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'The Shield debuted at Survivor Series 2012 and went on to become one of the most dominant factions in history.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Texas Rattlesnake%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, '''Stone Cold'' Steve Austin is known as The Texas Rattlesnake.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%Streak vs Career%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'WrestleMania 26 in Phoenix, Arizona (2010), where The Undertaker defeated Shawn Michaels.', 'AI Assistant (Automated)', true);
    ELSIF q.body ILIKE '%1,300 days%' THEN
      INSERT INTO solutions (question_id, body, author, is_accepted)
      VALUES (q.id, 'Roman Reigns held the Undisputed WWE Universal Championship for 1,316 days from 2020 to 2024.', 'AI Assistant (Automated)', true);
    END IF;
  END LOOP;
END $$;

