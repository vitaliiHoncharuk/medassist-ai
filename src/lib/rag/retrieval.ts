import { cosineDistance, desc, gt, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { embeddings, documents } from "@/lib/db/schema";
import { generateEmbedding } from "./embeddings";

const SIMILARITY_THRESHOLD = 0.3;
const TOP_K = 5;

export type RetrievedChunk = {
  content: string;
  documentName: string;
  similarity: number;
};

/**
 * Find the most relevant document chunks for a given query using cosine similarity.
 * Returns top-K chunks above the similarity threshold.
 */
export const retrieveRelevantChunks = async (
  query: string
): Promise<RetrievedChunk[]> => {
  const queryEmbedding = await generateEmbedding(query);

  const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryEmbedding)})`;

  const db = getDb();

  const results = await db
    .select({
      content: embeddings.content,
      documentName: documents.name,
      similarity,
    })
    .from(embeddings)
    .innerJoin(documents, sql`${embeddings.documentId} = ${documents.id}`)
    .where(gt(similarity, SIMILARITY_THRESHOLD))
    .orderBy(desc(similarity))
    .limit(TOP_K);

  return results.map((r) => ({
    content: r.content,
    documentName: r.documentName,
    similarity: Number(r.similarity),
  }));
};
