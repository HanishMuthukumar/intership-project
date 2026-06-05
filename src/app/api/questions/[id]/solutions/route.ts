import { supabase } from "@/lib/supabase";

// GET /api/questions/[id]/solutions — list solutions with vote counts
// POST /api/questions/[id]/solutions — add a new solution option
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;

  const { data, error } = await supabase
    .from("solutions")
    .select("id, body, author, created_at, is_accepted, solution_votes(count)")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const solutions = (data ?? []).map((s) => ({
    id: s.id,
    body: s.body,
    author: s.author,
    is_accepted: s.is_accepted || false,
    votes: s.solution_votes?.[0]?.count ?? 0,
  }));

  return Response.json({ solutions });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const { body, author } = await req.json();

  if (!body?.trim()) {
    return Response.json({ error: "Solution body is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("solutions")
    .insert({ question_id: questionId, body: body.trim(), author: author || null })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
