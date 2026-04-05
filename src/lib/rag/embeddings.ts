import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 100;

/** Dimension of the text-embedding-3-small model output. Shared with DB schema. */
export const EMBEDDING_DIM = 1536;

/**
 * Generate embedding for a single text string.
 */
export const generateEmbedding = async (
  text: string
): Promise<number[]> => {
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
