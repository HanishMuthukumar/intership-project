import { GoogleGenAI } from "@google/genai";

// Initialize GoogleGenAI SDK client if API key is present
const hasApiKey = !!process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (hasApiKey) {
  try {
    ai = new GoogleGenAI({});
    console.log("GoogleGenAI initialized successfully using GEMINI_API_KEY.");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Failed to initialize GoogleGenAI:", message);
  }
} else {
  console.warn("GEMINI_API_KEY not found. GoogleGenAI features will run in local fallback mode.");
}

const TOPIC_ANSWERS: Record<string, string[]> = {
  "Champions": [
    "John Cena holds the record for most WWE Championship reigns tied with Ric Flair at 16 times combined across brands. He's one of the most decorated champions in history.",
    "Roman Reigns' Tribal Chief era saw him hold the Universal/WWE Championship for over 1,000 days, one of the longest reigns in modern WWE history.",
    "The Rock won his first WWE Championship in 1998 at Survivor Series, beating Mankind with Vince McMahon's interference to become the 'Corporate Champion'.",
  ],
  "Legends": [
    "The Undertaker debuted at Survivor Series 1990 and wrestled for over 30 years, becoming one of the most iconic characters in WWE history with his 'Deadman' persona.",
    "Stone Cold Steve Austin's rivalry with Vince McMahon in the Attitude Era is considered one of the greatest storylines in wrestling history, propelling WWE to mainstream success.",
    "Shawn Michaels, known as 'Mr. WrestleMania', is widely regarded as one of the greatest in-ring performers of all time, famous for matches like the Iron Man match at WrestleMania 12.",
  ],
  "PPV Events": [
    "WrestleMania is WWE's biggest annual event, dubbed 'The Showcase of the Immortals'. It has taken place every year since WrestleMania 1 in 1985 at Madison Square Garden.",
    "SummerSlam is WWE's second biggest PPV, held annually in August. It's known as 'The Biggest Party of the Summer' and has featured many memorable championship matches.",
    "Royal Rumble is held every January and features the iconic 30-man Royal Rumble match where the winner earns a championship match at WrestleMania.",
  ],
  "Tag Teams": [
    "The Hardy Boyz (Matt and Jeff Hardy) are one of the most beloved tag teams in history, known for their high-flying TLC (Tables, Ladders, and Chairs) matches.",
    "The Brothers of Destruction — The Undertaker and Kane — teamed up multiple times despite being rivals, combining their supernatural personas for a dominant tag team.",
    "The New Day (Big E, Kofi Kingston, Xavier Woods) became one of the longest-reigning tag teams in WWE history, holding the belts for 483 days from 2015 to 2016.",
  ],
  "Royal Rumble": [
    "The Royal Rumble match was first held in 1988. Entrants come in every 90 seconds and are eliminated by being thrown over the top rope with both feet touching the floor.",
    "Shawn Michaels and Triple H both entered the Royal Rumble match at #1 position and went on to win, an incredibly rare feat in the event's history.",
    "Batista won the 2005 Royal Rumble by last eliminating John Cena in a controversial double-elimination that had to be re-done, going on to win the World Heavyweight Title at WrestleMania 21.",
  ],
  "WrestleMania": [
    "The Undertaker's WrestleMania streak lasted from WrestleMania 7 (1991) to WrestleMania 29 (2013), going 21-0 before being shocked by Brock Lesnar at WrestleMania 30.",
    "WrestleMania III in 1987 holds the record for largest indoor attendance in professional wrestling history, with over 93,000 fans at the Pontiac Silverdome in Michigan.",
    "Hulk Hogan vs André the Giant at WrestleMania III remains one of the most iconic matches ever, with Hogan famously bodyslaming the 500-pound André.",
  ],
  "Rivalries": [
    "Austin vs McMahon (1997–2001) is widely considered the greatest rivalry in wrestling history. Their feud defined the Attitude Era and drove WWE's mainstream popularity.",
    "The Rock vs Steve Austin had three WrestleMania encounters (XV, X-Seven, XIX), with their WrestleMania X-Seven match often voted the greatest match ever.",
    "John Cena vs CM Punk's rivalry, especially their 2011 feud, is remembered for CM Punk's legendary 'Pipe Bomb' promo that blurred the lines between reality and fiction.",
  ],
  "General": [
    "WWE stands for World Wrestling Entertainment. It was founded in 1953 as Capitol Wrestling Corporation by Jess McMahon and Toots Mondt, later becoming WWF and then WWE in 2002.",
    "The WWE Hall of Fame was established in 1993 and inducts legendary wrestlers each year during WrestleMania weekend. André the Giant was the first inductee.",
    "Pro wrestling is a form of performance art combining athletics and theatrical entertainment. WWE uses the term 'sports entertainment' to describe its product.",
  ]
};


// Calculate Levenshtein Distance similarity score (0 to 1)
export function getSimilarity(s1: string, s2: string): number {
  let longer = s1.toLowerCase().trim();
  let shorter = s2.toLowerCase().trim();
  if (longer.length < shorter.length) {
    const temp = longer;
    longer = shorter;
    shorter = temp;
  }
  const longerLength = longer.length;
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini embedding API call failed:", message);
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
      contents: `You are an expert WWE Quiz Assistant with deep knowledge of professional wrestling history, championships, superstars, PPV events, and rivalries.
Question: "${questionBody}"
Tags: ${tags.join(", ") || "General"}

Provide a concise, accurate, and entertaining answer (1-3 sentences) suitable for a WWE quiz platform. Include relevant facts, dates, or trivia when possible.`,
    });
    
    if (response.text) {
      return response.text.trim();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Gemini text generation failed, falling back to local advice:", message);
  }

  return generateAIResponse(questionBody, tags);
}
