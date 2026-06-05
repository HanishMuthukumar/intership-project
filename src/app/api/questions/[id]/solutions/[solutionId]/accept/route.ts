import { supabase } from "@/lib/supabase";

// POST /api/questions/[id]/solutions/[solutionId]/accept — Toggle/set acceptance status of a solution
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; solutionId: string }> }
) {
  const { id: questionId, solutionId } = await params;
  const { isAccepted } = await req.json();

  // First, unset all other accepted solutions for this question (only one accepted solution per question)
  if (isAccepted) {
    await supabase
      .from("solutions")
      .update({ is_accepted: false })
      .eq("question_id", questionId);
  }

  // Set this one
  const { error } = await supabase
    .from("solutions")
    .update({ is_accepted: isAccepted })
    .eq("id", solutionId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
