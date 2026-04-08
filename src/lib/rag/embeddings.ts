import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 100;

/**
 * Generate embedding for a single text string.
 */
export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
  if (!text.trim()) {
    throw new Error("Cannot generate embedding for empty text");
  }
  const { embedding } = await embed({
    model: openai.embedding(EMBEDDING_MODEL),
    value: text,
  });
  return embedding;
};

/**
 * Generate embeddings for multiple texts in batches.
 * OpenAI supports up to 2048 texts per request, but we batch at 100 for safety.
 */
export const generateEmbeddings = async (
  texts: string[]
): Promise<number[][]> => {
  const nonEmpty = texts.filter((t) => t.trim());
  if (nonEmpty.length !== texts.length) {
    throw new Error("Cannot generate embeddings for empty text entries");
  }
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { embeddings } = await embedMany({
      model: openai.embedding(EMBEDDING_MODEL),
      values: batch,
    });
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
};
