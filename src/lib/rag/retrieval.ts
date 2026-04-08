import { cosineDistance, desc, eq, gt, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { embeddings, documents } from "@/lib/db/schema";
import { generateEmbedding } from "./embeddings";

const SIMILARITY_THRESHOLD = 0.4;
const TOP_K = 5;

export type RetrievedChunk = {
  content: string;
  documentName: string;
  chunkIndex: number;
  totalChunks: number;
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
      chunkIndex: embeddings.chunkIndex,
      documentName: documents.name,
      totalChunks: documents.chunkCount,
      similarity,
    })
    .from(embeddings)
    .innerJoin(documents, eq(embeddings.documentId, documents.id))
    .where(gt(similarity, SIMILARITY_THRESHOLD))
    .orderBy(desc(similarity))
    .limit(TOP_K);

  return results.map((r) => ({
    content: r.content,
    documentName: r.documentName,
    chunkIndex: r.chunkIndex,
    totalChunks: r.totalChunks,
    similarity: Number(r.similarity),
  }));
};
