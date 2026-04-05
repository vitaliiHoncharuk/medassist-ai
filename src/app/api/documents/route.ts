import { NextResponse } from "next/server";
import { z } from "zod";
import { PDFParse } from "pdf-parse";
import { desc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { documents, embeddings } from "@/lib/db/schema";
import { chunkText } from "@/lib/rag/chunker";
import { generateEmbeddings } from "@/lib/rag/embeddings";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".txt"]);
const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46]; // %PDF

const fileValidationSchema = z.object({
  name: z.string().min(1),
  type: z.string().refine((t) => ALLOWED_TYPES.has(t), {
    message: "Only PDF and TXT files are supported",
  }),
  size: z.number().max(MAX_FILE_SIZE, "File size must be under 10MB"),
});

/**
 * Extract file extension from filename (lowercase, including the dot).
 */
const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
};

/**
 * Validate that a buffer's magic bytes match the claimed file type.
 * - PDF files must start with %PDF (0x25 0x50 0x44 0x46).
 * - TXT files must be valid UTF-8 text (no null bytes in the first 8KB).
 */
const validateMagicBytes = (
  buffer: Uint8Array,
  claimedType: string
): boolean => {
  if (claimedType === "application/pdf") {
    if (buffer.length < 4) return false;
    return PDF_MAGIC_BYTES.every((byte, i) => buffer[i] === byte);
  }

  if (claimedType === "text/plain") {
    // Check first 8KB for null bytes — binary files contain them, text files don't
    const checkLength = Math.min(buffer.length, 8192);
    for (let i = 0; i < checkLength; i++) {
      if (buffer[i] === 0x00) return false;
    }
    return true;
  }

  return false;
};

/**
 * POST /api/documents — Upload and process a document.
 * Accepts FormData with a single file field.
 * Flow: validate -> extract text -> chunk -> embed -> store in DB.
 */
export const POST = async (req: Request): Promise<Response> => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file metadata
    const validation = fileValidationSchema.safeParse({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message ?? "Invalid file" },
        { status: 400 }
      );
    }

    // Validate file extension matches claimed MIME type
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: "Only .pdf and .txt file extensions are supported" },
        { status: 400 }
      );
    }

    // Read file bytes for magic byte validation and content extraction
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    // Validate magic bytes match the claimed type
    if (!validateMagicBytes(fileBytes, file.type)) {
      return NextResponse.json(
        {
          error:
            "File content does not match the claimed file type. Please upload a valid PDF or TXT file.",
        },
        { status: 400 }
      );
    }

    // Extract text content
    let textContent: string;

    if (file.type === "application/pdf") {
      const buffer = Buffer.from(arrayBuffer);
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const textResult = await parser.getText();
        textContent = textResult.text;
      } finally {
        await parser.destroy();
      }
    } else {
      textContent = new TextDecoder().decode(fileBytes);
    }

    if (!textContent.trim()) {
      return NextResponse.json(
        { error: "File appears to be empty or contains no extractable text" },
        { status: 400 }
      );
    }

    // Chunk the text
    const chunks = chunkText(textContent);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Could not generate text chunks from the file" },
        { status: 400 }
      );
    }

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map((c) => c.content);
    const embeddingVectors = await generateEmbeddings(chunkTexts);

    // Store in a transaction: insert document + all embeddings atomically
    const db = getDb();
    const insertedDoc = await db.transaction(async (tx) => {
      const [doc] = await tx
        .insert(documents)
        .values({
          name: file.name,
          content: textContent,
          chunkCount: chunks.length,
        })
        .returning({
          id: documents.id,
          name: documents.name,
          chunkCount: documents.chunkCount,
        });

      if (!doc) {
        throw new Error("Failed to insert document");
      }

      // Insert embeddings in bulk
      const embeddingRows = chunks.map((chunk, i) => ({
        documentId: doc.id,
        content: chunk.content,
        embedding: embeddingVectors[i] as number[],
      }));

      await tx.insert(embeddings).values(embeddingRows);

      return doc;
    });

    return NextResponse.json({
      id: insertedDoc.id,
      name: insertedDoc.name,
      chunkCount: insertedDoc.chunkCount,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the document" },
      { status: 500 }
    );
  }
};

/**
 * GET /api/documents — List all uploaded documents.
 */
export const GET = async (): Promise<Response> => {
  try {
    const db = getDb();
    const docs = await db
      .select({
        id: documents.id,
        name: documents.name,
        chunkCount: documents.chunkCount,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .orderBy(desc(documents.createdAt));

    return NextResponse.json({ documents: docs });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
};
