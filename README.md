# MedAssist AI

A production-quality RAG (Retrieval-Augmented Generation) chatbot for healthcare document search. Upload medical documents — clinical guidelines, formulary lists, drug references — and ask questions in natural language. The AI retrieves relevant sections and generates accurate, cited answers.

## Features

- **Streaming chat** — Real-time AI responses with Vercel AI SDK
- **Document upload** — Drag & drop PDF/TXT files, automatically chunked and embedded
- **RAG retrieval** — Cosine similarity search over document embeddings (top-5 chunks)
- **Source citations** — Every response shows which documents and sections were used
- **Conversation history** — Persisted in localStorage, up to 5 conversations
- **Document management** — Upload, list, and delete documents
- **Healthcare theming** — Professional medical UI with PHI disclaimer
- **Dark / light mode** — Follows system preference
- **Mobile responsive** — Full viewport on mobile, centered layout on desktop
- **Rate limiting** — Sliding window (5 req/min per IP) via Upstash Redis

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI Chat | Vercel AI SDK + Claude Sonnet |
| Embeddings | OpenAI `text-embedding-3-small` |
| Database | Neon PostgreSQL (serverless) + pgvector |
| ORM | Drizzle ORM |
| Rate Limiting | Upstash Redis |
| Animations | Motion (Framer Motion) |
| Markdown | react-markdown + rehype-highlight |
| Deploy | Vercel |

## How It Works

```
User uploads document
  → Text extracted (PDF/TXT)
  → Split into ~500-token chunks
  → Each chunk embedded via OpenAI
  → Stored in PostgreSQL with pgvector

User asks a question
  → Question embedded
  → Cosine similarity search finds top-5 relevant chunks
  → Chunks injected as context into Claude prompt
  → Streaming response with source citations
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/medassist-ai.git
cd medassist-ai
pnpm install
```

### 2. Create external services (free tiers)

**Neon PostgreSQL** — [console.neon.tech](https://console.neon.tech)
1. Create a project, copy the connection string
2. Enable pgvector in the SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

**Upstash Redis** — [console.upstash.com](https://console.upstash.com)
1. Create a Redis database
2. Copy the REST URL and REST token

**API Keys**
- Anthropic (Claude): [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- OpenAI (Embeddings): [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your keys:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...
```

### 4. Push database schema

```bash
pnpm drizzle-kit push
```

### 5. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Test the flow

1. Go to `/documents` and upload a PDF or TXT file
2. Wait for processing (chunking + embedding)
3. Go to `/` and ask a question about the uploaded document
4. You should see a streaming response with `[Source N: Document Name]` citations

## Project Structure

```
src/
  app/
    page.tsx                  # Chat interface
    documents/page.tsx        # Document management
    api/
      chat/route.ts           # RAG retrieval + streaming response
      documents/route.ts      # Upload, list, delete documents
      documents/[id]/route.ts # Delete specific document
  components/
    ui/                       # shadcn/ui primitives
    chat/                     # Chat UI (container, input, messages, markdown)
    documents/                # Document upload, list, cards
  lib/
    db/
      index.ts                # Database connection
      schema.ts               # Drizzle schema (documents + embeddings)
    chat/
      constants.ts            # System prompt, config
      storage.ts              # localStorage conversations
      rate-limit.ts           # Upstash rate limiter
    rag/
      chunker.ts              # Text chunking (~500 tokens)
      embeddings.ts           # OpenAI embedding generation
      retrieval.ts            # pgvector cosine similarity search
```

## Database Schema

```sql
-- documents
id          UUID PRIMARY KEY
name        TEXT NOT NULL
content     TEXT NOT NULL
chunk_count INTEGER NOT NULL DEFAULT 0
created_at  TIMESTAMP DEFAULT now()

-- embeddings
id          UUID PRIMARY KEY
document_id UUID REFERENCES documents(id) ON DELETE CASCADE
content     TEXT NOT NULL          -- chunk text
embedding   VECTOR(1536) NOT NULL  -- text-embedding-3-small
created_at  TIMESTAMP DEFAULT now()
```

## Deployment

Set environment variables in [Vercel](https://vercel.com) project settings, then:

```bash
npx vercel --prod
```

## Cost Estimate

| Service | Free Tier | Approx. Monthly Cost |
|---------|-----------|---------------------|
| Neon PostgreSQL | 0.5 GB storage | $0 |
| Vercel Hosting | 100 GB bandwidth | $0 |
| Upstash Redis | 10,000 req/day | $0 |
| OpenAI Embeddings | Pay-per-use | ~$0.02/document |
| Claude API | Pay-per-use | ~$0.05–0.15/chat |

Total for light usage: **under $5/month**.

## License

MIT
