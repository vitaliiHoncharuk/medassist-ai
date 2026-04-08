import type { DocumentDTO } from "@/lib/db/schema";

type DocumentListResponse = {
  documents: DocumentDTO[];
};

type DocumentUploadResponse = {
  id: string;
  name: string;
  chunkCount: number;
};

type ApiErrorResponse = {
  error: string;
};

const parseErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const data: unknown = await response.json();
    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof (data as ApiErrorResponse).error === "string"
    ) {
      return (data as ApiErrorResponse).error;
    }
  } catch {
    // Response wasn't JSON
  }
  return fallback;
};

export const fetchDocuments = async (): Promise<DocumentDTO[]> => {
  const response = await fetch("/api/documents");
  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to load documents");
    throw new Error(message);
  }

  const data = (await response.json()) as DocumentListResponse;
  return data.documents;
};

export const uploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/documents", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Upload failed");
    throw new Error(message);
  }

  return (await response.json()) as DocumentUploadResponse;
};

export const deleteDocument = async (id: string): Promise<void> => {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Failed to delete document");
    throw new Error(message);
  }
};
