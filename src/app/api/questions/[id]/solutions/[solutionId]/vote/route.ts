import { supabase } from "@/lib/supabase";

// POST /api/questions/[id]/solutions/[solutionId]/vote — vote for a solution
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; solutionId: string }> }
) {
  const { solutionId } = await params;
  const { voterId } = await req.json();

  const { error } = await supabase
    .from("solution_votes")
    .insert({ solution_id: solutionId, voter_id: voterId });

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "already voted" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
