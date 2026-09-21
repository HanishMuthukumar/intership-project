# 🏆 WWE Live Quiz Arena

An interactive, real-time WWE Live Quiz and Polling application powered by **Next.js (App Router)**, **Supabase (PostgreSQL + pgvector)**, and **Google Gemini AI**.

Live on Vercel: [https://intership-project-xy9l.vercel.app](https://intership-project-xy9l.vercel.app)

---

## 🌟 Key Features

1. **Challenger Registration & Profile:**
   - Step into the ring by registering with your Name, Age, and Email.
   - Profile persisted locally; automatically welcomes back existing champions.

2. **WWE Trivia & Community Questions:**
   - Ask questions across 8 official WWE categories:
     - 🥇 `Champions`
     - 👑 `Legends`
     - 🎟️ `PPV Events`
     - 👥 `Tag Teams`
     - ⏱️ `Royal Rumble`
     - ⚡ `WrestleMania`
     - 🔥 `Rivalries`
     - 🌐 `General`
   - Real-time upvoting system with duplicate prevention per voter ID.

3. **Gemini AI Assistant & Auto-Answers:**
   - Powered by Google Gemini (`gemini-2.5-flash`): Automatically generates detailed, fact-checked answers for every new question submitted by challengers.
   - Built-in graceful WWE fallback knowledge base for high availability.

4. **Smart AI Semantic Search & Duplicate Detection:**
   - 768-dimensional vector embeddings generated using Gemini Embedding model.
   - Instant duplicate warnings while typing a question to prevent repetitive trivia.
   - Semantic vector similarity search (`pgvector` cosine distance) + Postgres GIN full-text search.

5. **Live Polling & Solution Verification:**
   - Interactive poll bars with percentage calculations and vote counts.
   - Community members can submit alternative solution options.
   - Verify / accept correct WWE answers with the verified badge.

6. **Dynamic Theme Switcher:**
   - Interactive canvas particle background with multiple ringside themes:
     - `darkpink`, `ocean`, `sunset`, `cosmic`.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript)
- **Styling:** Tailwind CSS
- **Database:** Supabase PostgreSQL with `pgvector` & Row-Level Security
- **AI / Embeddings:** Google Gemini (`@google/genai`)
- **Deployment:** Vercel

---

## 🚀 Environment Variables

Create a `.env.local` file in the root directory:

```env
SUPABASE_URL=https://ckibvzxicpvtrojtalqw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

