import { GoogleGenAI } from "@google/genai";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ 
      error: "GEMINI_API_KEY is not configured in .env.local. Please add it to enable Gemini AI integration." 
    }, { status: 500 });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say 'it works' and nothing else.",
    });
    return Response.json({ reply: res.text?.trim() });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
