/** Dimension of the text-embedding-3-small model output. Used by DB schema and RAG pipeline. */
export const EMBEDDING_DIM = 1536;

/** Maximum file size for document uploads (10MB). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed MIME types for document uploads. */
export const ALLOWED_MIME_TYPES = new Set(["application/pdf", "text/plain"]);

/** Allowed file extensions for document uploads. */
export const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt"]);
