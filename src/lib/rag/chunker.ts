/**
 * Text chunking for RAG pipeline.
 * Splits documents into ~500-token chunks with overlap for context continuity.
 */

const TARGET_CHUNK_SIZE = 500;
const OVERLAP_SIZE = 50;
const APPROX_CHARS_PER_TOKEN = 4;

type Chunk = {
  content: string;
  index: number;
};

/**
 * Split text into overlapping chunks of approximately TARGET_CHUNK_SIZE tokens.
 * Uses sentence boundaries when possible to avoid splitting mid-sentence.
 */
export const chunkText = (text: string): Chunk[] => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const targetChars = TARGET_CHUNK_SIZE * APPROX_CHARS_PER_TOKEN;
  const overlapChars = OVERLAP_SIZE * APPROX_CHARS_PER_TOKEN;

  // Split into sentences — handles medical abbreviations (Dr., mg., i.v., e.g., Fig., etc.)
  const sentences =
    cleaned.match(
      /(?:(?:Dr|Mr|Mrs|Ms|Prof|Fig|Vol|No|vs|etc|e\.g|i\.e|i\.v|i\.m|s\.c|p\.o|b\.i\.d|t\.i\.d|q\.i\.d|q\.d|h\.s|p\.r\.n|mg|mL|dL|mcg)\.\s*|[^.!?])+[.!?]+\s*|[^.!?]+$/gi
    ) ?? [cleaned];

  const chunks: Chunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;

    if (
      currentChunk.length + trimmedSentence.length > targetChars &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
      });
      chunkIndex++;

      // Keep overlap from end of previous chunk
      const overlapStart = Math.max(0, currentChunk.length - overlapChars);
      currentChunk = currentChunk.slice(overlapStart).trim() + " ";
    }

    currentChunk += trimmedSentence + " ";
  }

  // Add the final chunk if it has content
  const finalContent = currentChunk.trim();
  if (finalContent) {
    chunks.push({
      content: finalContent,
      index: chunkIndex,
    });
  }

  return chunks;
};
