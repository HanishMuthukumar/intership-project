import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { getAIEmbedding, getAIAnswer } from "@/lib/ai";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const t = searchParams.get("t")?.trim();

  // If filtered by category tag
  if (t) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, created_at, tags, votes(count)")
      .contains("tags", [t])
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    const questions = (data ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      author: row.author,
      tags: row.tags || [],
      votes: row.votes?.[0]?.count ?? 0,
    }));
    return Response.json({ questions, hasMore: false });
  }

  // If search query is provided (Smart AI Search)
  if (q) {
    try {
      const embedding = await getAIEmbedding(q);
      if (embedding) {
        // Run AI Semantic Smart Search via pgvector match function
        const { data, error } = await supabase.rpc("match_questions", {
          query_embedding: embedding,
          match_threshold: 0.1, // Show all matches with similarity > 10%
          match_count: PAGE_SIZE
        });

        if (!error && data) {
          const questions = data.map((row: any) => ({
            id: row.id,
            body: row.body,
            author: row.author,
            tags: row.tags || [],
            votes: row.votes ?? 0
          }));
          return Response.json({ questions, hasMore: false });
        } else if (error) {
          console.error("Supabase RPC match_questions failed:", error.message);
        }
      }
    } catch (err: any) {
      console.error("AI Semantic Search failed, falling back to keyword search:", err.message);
    }

    // Keyword text search fallback
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({ questions, hasMore: false });
  }

  const offset = Number(searchParams.get("offset") ?? 0);
  const { questions, hasMore } = await getQuestionsPage(offset, PAGE_SIZE);
  return Response.json({ questions, hasMore });
}

export async function POST(req: Request) {
  const { body, author, tags } = await req.json();

  // 1. Generate embedding vector if key is configured
  let embedding = null;
  try {
    embedding = await getAIEmbedding(body);
  } catch (err: any) {
    console.error("Failed to generate embedding for new question:", err.message);
  }

  // 2. Insert original question (with embedding if generated)
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert({
      body,
      author,
      tags: tags || [],
      ...(embedding ? { embedding } : {})
    })
    .select()
    .single();

  if (questionError) return Response.json({ error: questionError.message }, { status: 500 });

  // 3. Generate and Insert AI answer
  try {
    const aiAnswer = await getAIAnswer(body, tags || []);
    await supabase
      .from("solutions")
      .insert({
        question_id: questionData.id,
        body: aiAnswer,
        author: "AI Assistant (Automated)",
        is_accepted: false
      });
  } catch (err) {
    console.error("Failed to generate AI auto-response:", err);
  }

  return Response.json(questionData);
}
