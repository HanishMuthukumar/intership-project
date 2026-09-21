import { supabase } from "@/lib/supabase";
import { FALLBACK_QUESTIONS } from "@/lib/wwe-fallback-data";

export async function getQuestionsPage(offset: number, limit: number) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, created_at, tags, votes(count)")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    if (error || !data || data.length === 0) {
      // Fallback to local WWE questions gracefully
      const slice = FALLBACK_QUESTIONS.slice(offset, offset + limit);
      return {
        questions: slice,
        hasMore: offset + limit < FALLBACK_QUESTIONS.length,
      };
    }

    const rows = data.map((q) => ({
      id: q.id,
      body: q.body,
      author: q.author,
      tags: q.tags || [],
      votes: q.votes?.[0]?.count ?? 0,
    }));

    const hasMore = rows.length > limit;
    return { questions: rows.slice(0, limit), hasMore };
  } catch (err) {
    console.warn("Supabase unreachable in getQuestionsPage, serving fallback WWE data:", err);
    const slice = FALLBACK_QUESTIONS.slice(offset, offset + limit);
    return {
      questions: slice,
      hasMore: offset + limit < FALLBACK_QUESTIONS.length,
    };
  }
}

export async function searchQuestions(q: string, limit: number) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, body, author, created_at, tags, votes(count)")
      .textSearch("body", q, { type: "websearch", config: "english" })
      .limit(limit);

    if (error || !data) {
      const lower = q.toLowerCase();
      return FALLBACK_QUESTIONS.filter(
        (item) =>
          item.body.toLowerCase().includes(lower) ||
          item.tags.some((t) => t.toLowerCase().includes(lower))
      ).slice(0, limit);
    }

    return data.map((row) => ({
      id: row.id,
      body: row.body,
      author: row.author,
      tags: row.tags || [],
      votes: row.votes?.[0]?.count ?? 0,
    }));
  } catch (err) {
    console.warn("Supabase unreachable in searchQuestions, filtering fallback WWE data:", err);
    const lower = q.toLowerCase();
    return FALLBACK_QUESTIONS.filter(
      (item) =>
        item.body.toLowerCase().includes(lower) ||
        item.tags.some((t) => t.toLowerCase().includes(lower))
    ).slice(0, limit);
  }
}
