import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";

import { CHAT_CONFIG, SYSTEM_PROMPT } from "@/lib/chat/constants";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import { extractClientIp } from "@/lib/chat/extract-ip";
import { retrieveRelevantChunks } from "@/lib/rag/retrieval";

const messagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(messagePartSchema).optional(),
  content: z.string().optional(),
});

const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(CHAT_CONFIG.maxMessages * 2),
});

export const maxDuration = 30;

/**
 * Extract text content from the last user message.
 */
const getLastUserMessage = (messages: UIMessage[]): string => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === "user") {
      const textParts =
        msg.parts
          ?.filter(
            (p): p is Extract<typeof p, { type: "text" }> => p.type === "text"
          )
          .map((p) => p.text)
          .join("") ?? "";
      return textParts;
    }
  }
  return "";
};

/**
 * Build context string from retrieved chunks with numbered source citations.
 */
const buildContextPrompt = (
  chunks: Awaited<ReturnType<typeof retrieveRelevantChunks>>
): string => {
  if (chunks.length === 0) {
    return "No relevant documents found. Let the user know that no matching information was found in the uploaded documents, and suggest they upload relevant documents or rephrase their question.";
  }

  const sourcesText = chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: ${chunk.documentName}]\n${chunk.content}`
    )
    .join("\n\n");

  return `The following relevant excerpts were retrieved from the user's uploaded medical documents. Use these to answer the question. Cite sources using [Source N: Document Name] format.\n\n${sourcesText}`;
};

export const POST = async (req: Request): Promise<Response> => {
  try {
    // Rate limit by IP
    const ip = extractClientIp(req.headers);
    const rateLimitResult = await checkRateLimit(ip);

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error:
            "Too many requests. Please wait a moment before sending another message.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body: unknown = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Cast to UIMessage[] — Zod validated the structure, SDK expects its own type
    const messages = parsed.data.messages as UIMessage[];

    // Get the last user message for RAG retrieval
    const lastUserMessage = getLastUserMessage(messages);

    // Reject empty/whitespace-only messages
    if (!lastUserMessage.trim()) {
      return new Response(
        JSON.stringify({
          error:
            "Please type a question so I can search the uploaded documents for relevant information.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Perform RAG retrieval
    let contextPrompt = "";
    if (lastUserMessage) {
      try {
        const relevantChunks = await retrieveRelevantChunks(lastUserMessage);
        contextPrompt = buildContextPrompt(relevantChunks);
      } catch {
        contextPrompt =
          "Note: Document retrieval is temporarily unavailable. Answer based on general knowledge but inform the user that document search encountered an error.";
      }
    }

    // Build system prompt with context
    const systemWithContext = `${SYSTEM_PROMPT}\n\n--- RETRIEVED CONTEXT ---\n${contextPrompt}`;

    // Trim to last N messages to stay within context limits
    const trimmedMessages = messages.slice(-CHAT_CONFIG.maxMessages);

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemWithContext,
      messages: await convertToModelMessages(trimmedMessages),
      abortSignal: req.signal,
    });

    return result.toUIMessageStreamResponse();
  } catch {
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
