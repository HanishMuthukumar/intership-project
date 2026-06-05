import { supabase } from "@/lib/supabase";
import { getSimilarity } from "@/lib/ai";

// GET /api/questions/similar?q=... — Check for semantically similar questions
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 5) {
    return Response.json({ similar: [] });
  }

  // Load last 50 questions to find similarity matching
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
    .filter(item => item.score > 0.35) // Threshold of 35% similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // Return top 3 matches

  return Response.json({ similar });
}
