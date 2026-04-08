import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { jsonError } from "@/lib/api/response";

const paramsSchema = z.object({
  id: z.string().uuid("Invalid document ID"),
});

/**
 * DELETE /api/documents/[id] — Delete a specific document.
 * CASCADE deletes associated embeddings via the FK constraint.
 */
export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  try {
    const resolvedParams = await params;
    const validation = paramsSchema.safeParse(resolvedParams);

    if (!validation.success) {
      return jsonError(
        validation.error.issues[0]?.message ?? "Invalid parameters",
        400
      );
    }

    const db = getDb();
    const deleted = await db
      .delete(documents)
      .where(eq(documents.id, validation.data.id))
      .returning({ id: documents.id });

    if (deleted.length === 0) {
      return jsonError("Document not found", 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
     
     
    console.error("Document delete error:", error);
    return jsonError("Failed to delete document", 500);
  }
};
