import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI SDK client if API key is present
const hasApiKey = !!process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (hasApiKey) {
  try {
    ai = new GoogleGenAI({});
    console.log("GoogleGenAI initialized successfully using GEMINI_API_KEY.");
  } catch (e: any) {
    console.error("Failed to initialize GoogleGenAI:", e.message);
  }
} else {
  console.warn("GEMINI_API_KEY not found. GoogleGenAI features will run in local fallback mode.");
}

const TOPIC_ANSWERS: Record<string, string[]> = {
  "Next.js": [
    "For Next.js App Router, ensure you use the 'use client' directive at the top of client-only components. Otherwise, components default to Server Components which cannot use hooks like useState or useEffect.",
    "If you need to fetch data on demand, declare 'export const dynamic = \"force-dynamic\"' at the page level. This prevents Next.js from aggressively caching the API page output at build time.",
    "Make sure you deploy using Vercel. Next.js is optimized to run serverless or edge functions on Vercel without manual node setup.",
  ],
  "React": [
    "Ensure you manage state updates properly. When updating state based on a previous state, use the functional update form, e.g., setVotes(prev => prev + 1), to prevent race conditions during fast clicking.",
    "Remember that React 19 / Next.js 16 handles form actions natively. You can pass async functions directly to the action prop of form elements instead of setting up onSubmit listeners.",
  ],
  "Database": [
    "For read performance, ensure you create Indexes on columns frequently referenced in WHERE clauses, JOIN conditions, and ORDER BY parameters. Check index execution using EXPLAIN ANALYZE.",
    "If you are using foreign key references (FK), always configure 'ON DELETE CASCADE' if child records should be cleaned up automatically when the parent row is deleted.",
    "Avoid checking database existence in code before inserting (TOCTOU race). Instead, use database constraints (like UNIQUE) and let Postgres handle validation automatically.",
  ],
  "Vercel": [
    "If Vercel builds show a 404 on API paths, verify the framework setting in Vercel settings is set to 'Next.js' and not 'Other/Static'.",
    "To disable SSO Deployment Protection which triggers 401 Unauthorized errors on preview URLs, run: vercel project protection disable --sso",
  ],
  "General": [
    "To build a smooth user experience, implement Optimistic UI updates. Modify local state immediately when an action is triggered, and only revert if the server request returns an error.",
    "Always debounce search queries by 300ms using a setTimeout inside a useEffect cleanup function to reduce database API overhead while typing.",
  ]
};

// Calculate Levenshtein Distance similarity score (0 to 1)
export function getSimilarity(s1: string, s2: string): number {
  let longer = s1.toLowerCase().trim();
  let shorter = s2.toLowerCase().trim();
  if (longer.length < shorter.length) {
    let temp = longer;
    longer = shorter;
    shorter = temp;
  }
  let longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  
  return (longerLength - costs[shorter.length]) / longerLength;
}

// Generate an intelligent answer based on categories/keywords (local fallback)
export function generateAIResponse(questionBody: string, tags: string[]): string {
  const selectedTags = tags.length > 0 ? tags : ["General"];
  
  // Find answers matching tags
  const potentialAnswers: string[] = [];
  selectedTags.forEach(tag => {
    if (TOPIC_ANSWERS[tag]) {
      potentialAnswers.push(...TOPIC_ANSWERS[tag]);
    }
  });

  if (potentialAnswers.length === 0) {
    potentialAnswers.push(...TOPIC_ANSWERS["General"]);
  }

  // Select a random matching advice
  const index = Math.floor(Math.random() * potentialAnswers.length);
  return potentialAnswers[index];
}

// Generate embedding vector using Gemini (768 dimensions)
export async function getAIEmbedding(text: string): Promise<number[] | null> {
  if (!ai) return null;

  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 768,
      },
    });
    
    const embedding = response.embeddings?.[0]?.values;
    if (embedding && embedding.length === 768) {
      return embedding;
    }
    return null;
  } catch (err: any) {
    console.error("Gemini embedding API call failed:", err.message);
    return null;
  }
}

// Generate real-time answer using Gemini 2.5 Flash
export async function getAIAnswer(questionBody: string, tags: string[]): Promise<string> {
  if (!ai) {
    return generateAIResponse(questionBody, tags);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an AI Teaching Assistant for an engineering/web development course.
Question: "${questionBody}"
Tags: ${tags.join(", ") || "General"}

Provide a concise, helpful, and technically accurate answer (1-3 sentences) suitable for a student Q&A board. Keep it brief.`,
    });
    
    if (response.text) {
      return response.text.trim();
    }
  } catch (err: any) {
    console.error("Gemini text generation failed, falling back to local advice:", err.message);
  }

  return generateAIResponse(questionBody, tags);
}
