-- Migration: Add WWE Category Tags and Solution Verification

-- ── 1. Add tags column to questions table ────────────────────────────────────
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY['General'];

-- ── 2. Add is_accepted column to solutions table ──────────────────────────────
ALTER TABLE solutions 
ADD COLUMN IF NOT EXISTS is_accepted boolean DEFAULT false;

-- ── 3. Populate tags for existing questions to match WWE categories ──────────
UPDATE questions 
SET tags = ARRAY['Champions', 'Legends'] 
WHERE body ILIKE '%Cena%' OR body ILIKE '%Rock%' OR body ILIKE '%Triple H%';

UPDATE questions 
SET tags = ARRAY['WrestleMania', 'Legends'] 
WHERE body ILIKE '%WrestleMania%' OR body ILIKE '%Undertaker%';

UPDATE questions 
SET tags = ARRAY['Royal Rumble'] 
WHERE body ILIKE '%Royal Rumble%';

UPDATE questions 
SET tags = ARRAY['Champions'] 
WHERE body ILIKE '%Universal%' OR body ILIKE '%Reigns%';

UPDATE questions 
SET tags = ARRAY['General'] 
WHERE tags IS NULL OR tags = '{}';

