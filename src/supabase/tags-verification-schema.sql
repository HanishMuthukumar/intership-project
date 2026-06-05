-- Migration: Add Category Tags and Solution Verification

-- ── 1. Add tags column to questions table ────────────────────────────────────
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- ── 2. Add is_accepted column to solutions table ──────────────────────────────
ALTER TABLE solutions 
ADD COLUMN IF NOT EXISTS is_accepted boolean DEFAULT false;

-- ── 3. Populate tags for existing questions to make the filters look populated ─
UPDATE questions 
SET tags = ARRAY['Next.js', 'Vercel'] 
WHERE body LIKE '%Vercel%' OR body LIKE '%deploy%';

UPDATE questions 
SET tags = ARRAY['React', 'Next.js'] 
WHERE body LIKE '%components%' OR body LIKE '%SSR%';

UPDATE questions 
SET tags = ARRAY['Database', 'Postgres'] 
WHERE body LIKE '%index%' OR body LIKE '%Postgres%' OR body LIKE '%Supabase%' OR body LIKE '%cascade%';

UPDATE questions 
SET tags = ARRAY['Search', 'Frontend'] 
WHERE body LIKE '%debounce%' OR body LIKE '%search%';

UPDATE questions 
SET tags = ARRAY['General'] 
WHERE tags IS NULL OR tags = '{}';
