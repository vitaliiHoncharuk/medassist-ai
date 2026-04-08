import type { UIMessage } from "ai";

/**
 * Extract text content from a UIMessage's parts array.
 */
export const extractTextFromParts = (message: UIMessage): string =>
  message.parts
    ?.filter(
      (p): p is Extract<typeof p, { type: "text" }> => p.type === "text"
    )
    .map((p) => p.text)
    .join("") ?? "";
