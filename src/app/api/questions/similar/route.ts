import { supabase } from "@/lib/supabase";
import { getSimilarity, getAIEmbedding } from "@/lib/ai";

// GET /api/questions/similar?q=... — Check for semantically similar questions
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 5) {
    return Response.json({ similar: [] });
  }

  // 1. Try Gemini semantic embedding matching first
  try {
    const embedding = await getAIEmbedding(q);
    if (embedding) {
      const { data, error } = await supabase.rpc("match_questions", {
        query_embedding: embedding,
        match_threshold: 0.60, // 60% similarity threshold for duplicate warnings
        match_count: 3
      });

      if (!error && data && data.length > 0) {
        const similar = data.map((row: { id: string; body: string; author: string | null; tags: string[] | null; similarity: number }) => ({
          id: row.id,
          body: row.body,
          author: row.author,
          tags: row.tags || [],
          score: row.similarity
        }));
        return Response.json({ similar });
      } else if (error) {
        console.error("Supabase RPC match_questions failed in similarity route:", error.message);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("AI Similarity check failed, falling back to Levenshtein:", message);
  }

  // 2. Offline Fallback: Load last 50 questions and compute Levenshtein similarity
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, tags")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const similar = (data ?? [])
      .map(row => {
        const score = getSimilarity(q, row.body);
        return {
          id: row.id,
          body: row.body,
          author: row.author,
          tags: row.tags || [],
          score,
        };
      })
      .filter(item => item.score > 0.35) // 35% Levenshtein threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Return top 3 matches

    return Response.json({ similar });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
