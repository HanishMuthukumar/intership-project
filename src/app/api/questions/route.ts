import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { getAIEmbedding, getAIAnswer } from "@/lib/ai";
import { FALLBACK_QUESTIONS } from "@/lib/wwe-fallback-data";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const t = searchParams.get("t")?.trim();

  // If filtered by category tag
  if (t) {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("id, body, author, created_at, tags, votes(count)")
        .contains("tags", [t])
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (!error && data && data.length > 0) {
        const questions = data.map((row) => ({
          id: row.id,
          body: row.body,
          author: row.author,
          tags: row.tags || [],
          votes: row.votes?.[0]?.count ?? 0,
        }));
        return Response.json({ questions, hasMore: false });
      }
    } catch {
      /* ignore and fallback */
    }

    // Fallback tag filter
    const lowerTag = t.toLowerCase();
    const questions = FALLBACK_QUESTIONS.filter((item) =>
      item.tags.some((tag) => tag.toLowerCase() === lowerTag)
    );
    return Response.json({ questions, hasMore: false });
  }

  // If search query is provided (Smart AI Search)
  if (q) {
    try {
      const embedding = await getAIEmbedding(q);
      if (embedding) {
        const { data, error } = await supabase.rpc("match_questions", {
          query_embedding: embedding,
          match_threshold: 0.1,
          match_count: PAGE_SIZE,
        });

        if (!error && data && data.length > 0) {
          const questions = data.map(
            (row: {
              id: string;
              body: string;
              author: string | null;
              tags: string[] | null;
              votes: number;
            }) => ({
              id: row.id,
              body: row.body,
              author: row.author,
              tags: row.tags || [],
              votes: row.votes ?? 0,
            })
          );
          return Response.json({ questions, hasMore: false });
        }
      }
    } catch (err) {
      console.warn("AI Semantic Search failed, falling back to keyword search:", err);
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

  let embedding = null;
  try {
    embedding = await getAIEmbedding(body);
  } catch (err) {
    console.warn("Embedding generation skipped:", err);
  }

  try {
    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .insert({
        body,
        author: author || "Challenger",
        tags: tags || [],
        ...(embedding ? { embedding } : {}),
      })
      .select()
      .single();

    if (!questionError && questionData) {
      // Generate AI answer
      try {
        const aiAnswer = await getAIAnswer(body, tags || []);
        await supabase.from("solutions").insert({
          question_id: questionData.id,
          body: aiAnswer,
          author: "AI Assistant (Automated)",
          is_accepted: false,
        });
      } catch (err) {
        console.warn("AI auto-response failed:", err);
      }
      return Response.json(questionData);
    }
  } catch {
    /* fallback below */
  }

  // Fallback response so user never sees a 500 error
  const newQuestion = {
    id: `wwe-q-${Date.now()}`,
    body,
    author: author || "Challenger",
    tags: tags || ["General"],
    votes: 0,
  };

  return Response.json(newQuestion);
}
