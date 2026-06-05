import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";
import { generateAIResponse } from "@/lib/ai";

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

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({ questions, hasMore: false });
  }

  const offset = Number(searchParams.get("offset") ?? 0);
  const { questions, hasMore } = await getQuestionsPage(offset, PAGE_SIZE);
  return Response.json({ questions, hasMore });
}

export async function POST(req: Request) {
  const { body, author, tags } = await req.json();

  // 1. Insert original question
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .insert({ body, author, tags: tags || [] })
    .select()
    .single();

  if (questionError) return Response.json({ error: questionError.message }, { status: 500 });

  // 2. Generate and Insert AI answer asynchronously/instantly
  try {
    const aiAnswer = generateAIResponse(body, tags || []);
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
