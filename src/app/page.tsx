import InteractiveBackground from "./interactive-background";
import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";

// Render on every request (don't cache/prerender) so new questions show up.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// Server component — runs only on the server, awaits the data, renders to HTML.
export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <>
      <InteractiveBackground />
      <main className="relative z-10 mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
        <header className="mb-7">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 pulse-dot" />
            Live now
          </span>
          <h1 className="text-3xl font-semibold tracking-tight gradient-text">
            Live Q&amp;A
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            Ask a question, upvote the ones you want answered, and vote on solutions.
          </p>
        </header>
        <QuestionsList initialQuestions={questions} initialHasMore={hasMore} />
      </main>
    </>
  );
}