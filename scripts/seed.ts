/**
 * Seed script — loads sample_docs/ PDFs into the database.
 *
 * Usage: pnpm db:seed
 *
 * Reads each PDF, extracts text, chunks it, generates embeddings via OpenAI,
 * and inserts everything into Neon PostgreSQL. Skips documents that already
 * exist (matched by filename) so re-running is safe.
 */

import { config } from "dotenv";
config({ path: ".env.local", override: false });

import fs from "node:fs";
import path from "node:path";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { extractText } from "unpdf";
import { eq } from "drizzle-orm";

// Node.js < 22 doesn't have global WebSocket — Neon serverless driver needs it
neonConfig.webSocketConstructor = ws;

import { getDb } from "@/lib/db";
import { documents, embeddings } from "@/lib/db/schema";
import { chunkText } from "@/lib/rag/chunker";
import { generateEmbeddings } from "@/lib/rag/embeddings";

const SAMPLE_DOCS_DIR = path.resolve(process.cwd(), "sample_docs");

const extractPdfText = async (filePath: string): Promise<string> => {
  const buffer = fs.readFileSync(filePath);
  const { text } = await extractText(new Uint8Array(buffer));
  return text.join("\n");
};

const seed = async (): Promise<void> => {
  const db = getDb();

  // Gather PDF files from sample_docs/
  const files = fs
    .readdirSync(SAMPLE_DOCS_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  if (files.length === 0) {
     
    console.log("No PDF files found in sample_docs/");
    return;
  }

   
  console.log(`Found ${files.length} sample documents to seed.\n`);

  for (const fileName of files) {
    // Check if already seeded
    const existing = await db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.name, fileName))
      .limit(1);

    if (existing.length > 0) {
       
      console.log(`  Skipping "${fileName}" — already in database.`);
      continue;
    }

    const filePath = path.join(SAMPLE_DOCS_DIR, fileName);

     
    console.log(`  Processing "${fileName}"...`);

    // 1. Extract text
    const textContent = await extractPdfText(filePath);
    if (!textContent.trim()) {
       
      console.log(`    Warning: no extractable text, skipping.`);
      continue;
    }

    // 2. Chunk
    const chunks = chunkText(textContent);
     
    console.log(`    ${chunks.length} chunks`);

    // 3. Embed
    const chunkTexts = chunks.map((c) => c.content);
    const embeddingVectors = await generateEmbeddings(chunkTexts);
     
    console.log(`    ${embeddingVectors.length} embeddings generated`);

    // 4. Insert in a transaction
    await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          name: fileName,
          content: textContent,
          chunkCount: chunks.length,
        })
        .returning({ id: documents.id });

      if (!doc) throw new Error(`Failed to insert document: ${fileName}`);

      const embeddingRows = chunks.map((chunk, i) => ({
        documentId: doc.id,
        content: chunk.content,
        chunkIndex: chunk.index,
        embedding: embeddingVectors[i] as number[],
      }));

      await tx.insert(embeddings).values(embeddingRows);
    });

     
    console.log(`    Done.`);
  }

   
  console.log("\nSeed complete.");
};

seed().catch((err) => {
   
  console.error("Seed failed:", err);
  process.exit(1);
});
