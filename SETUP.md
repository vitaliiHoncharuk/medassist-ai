# MedAssist AI — Setup Guide

Get the app fully functional in 4 steps. Total time: ~15 minutes.

## Step 1: Create External Services (free tiers)

You need 3 services. All have free tiers sufficient for this project.

### 1a. Neon PostgreSQL (vector database)

1. Go to [console.neon.tech](https://console.neon.tech) and sign up
2. Create a new project (name it "medassist-ai", pick the closest region)
3. On the dashboard, copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Enable the pgvector extension — open the **SQL Editor** in Neon console and run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 1b. Upstash Redis (rate limiting)

1. Go to [console.upstash.com](https://console.upstash.com) and sign up
2. Create a new Redis database (name: "medassist-ai", region: closest to you)
3. On the database page, copy:
   - **UPSTASH_REDIS_REST_URL** (starts with `https://`)
   - **UPSTASH_REDIS_REST_TOKEN** (starts with `AX`)

### 1c. API Keys

- **Anthropic (Claude)**: Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) → Create Key
- **OpenAI (Embeddings)**: Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create new secret key

## Step 2: Configure Environment Variables

### For local development

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

If `.env.example` doesn't exist, create `.env.local` manually with:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXyour-token-here
```

### For Vercel (production)

Go to [vercel.com](https://vercel.com) → your MedAssist AI project → **Settings** → **Environment Variables**.

Add each variable:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `DATABASE_URL` | Your Neon connection string |
| `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST token |

Make sure all are enabled for **Production**, **Preview**, and **Development**.

## Step 3: Push Database Schema

With `DATABASE_URL` set in `.env.local`, run:

```bash
pnpm drizzle-kit push
```

This creates the `documents` and `embeddings` tables with the pgvector HNSW index in your Neon database.

You should see output confirming both tables were created.

## Step 4: Run and Test

### Local

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the chat interface with the PHI disclaimer banner.

### Test the full flow

1. Go to [/documents](http://localhost:3000/documents)
2. Upload a PDF or TXT file (medical guidelines, drug reference, etc.)
3. Wait for the upload to complete (the file gets chunked and embedded — may take a few seconds)
4. Go back to [/](http://localhost:3000) (the chat page)
5. Ask a question about the uploaded document
6. You should see a streaming response with `[Source N: Document Name]` citations

### Deploy to production

After setting env vars in Vercel (Step 2), redeploy:

```bash
npx vercel --prod
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "DATABASE_URL is not set" error | Make sure `.env.local` exists with the correct Neon connection string |
| PDF upload fails | Check that the file is under 10MB and is a real PDF (not a renamed file) |
| Chat returns empty/no citations | Make sure you've uploaded at least one document first |
| Rate limit errors | The app limits to 5 requests/minute per IP. Wait and retry. |
| `drizzle-kit push` fails | Verify your `DATABASE_URL` is correct and that pgvector extension is enabled (`CREATE EXTENSION IF NOT EXISTS vector;`) |
| Build fails with pdf-parse error | This is expected on Edge Runtime. All API routes use Node.js runtime by default. |

## Sample Documents for Testing

For demo purposes, use these freely available medical documents:

- [WHO Model List of Essential Medicines (PDF)](https://www.who.int/publications/i/item/WHO-MHP-HPS-EML-2023.02)
- [CDC Antibiotic Prescribing Guidelines](https://www.cdc.gov/antibiotic-use/clinicians/index.html)
- [FDA Drug Safety Communications](https://www.fda.gov/drugs/drug-safety-and-availability/drug-safety-communications)

Upload 2-3 documents to give the demo realistic content.

## Cost Estimate

| Service | Free Tier Limit | Monthly Cost |
|---------|----------------|--------------|
| Neon PostgreSQL | 0.5 GB storage | $0 |
| Vercel Hosting | 100 GB bandwidth | $0 |
| Upstash Redis | 10,000 req/day | $0 |
| OpenAI Embeddings | Pay-per-use | ~$0.02 per document |
| Claude API | Pay-per-use | ~$0.05-0.15 per chat |

Total for light demo usage: **under $5/month**.
