import type { UIMessage } from "ai";
import { z } from "zod";

import type { Conversation } from "./types";
import { CHAT_CONFIG, STORAGE_KEYS } from "./constants";

const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.object({ type: z.string() }).passthrough()).optional(),
  content: z.string().optional(),
});

const isClient = typeof window !== "undefined";

const safeGetItem = (key: string): string | null => {
  if (!isClient) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  if (!isClient) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked — silently fail
  }
};

const safeRemoveItem = (key: string): void => {
  if (!isClient) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
};

// --- Conversations ---

export const getConversations = (): Conversation[] => {
  const raw = safeGetItem(STORAGE_KEYS.conversations);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = z.array(conversationSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
};

const saveConversations = (conversations: Conversation[]): void => {
  safeSetItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
};

export const createConversation = (title: string): Conversation => {
  const conversations = getConversations();
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [conversation, ...conversations];

  // Prune to max conversations limit
  if (updated.length > CHAT_CONFIG.maxConversations) {
    const removed = updated.splice(CHAT_CONFIG.maxConversations);
    for (const conv of removed) {
      safeRemoveItem(STORAGE_KEYS.messages(conv.id));
    }
  }

  saveConversations(updated);
  return conversation;
};

export const updateConversation = (
  id: string,
  updates: Partial<Pick<Conversation, "title" | "updatedAt">>
): void => {
  const conversations = getConversations();
  const index = conversations.findIndex((c) => c.id === id);
  if (index === -1) return;

  conversations[index] = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveConversations(conversations);
};

// --- Messages ---

export const getMessages = (conversationId: string): UIMessage[] => {
  const raw = safeGetItem(STORAGE_KEYS.messages(conversationId));
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = z.array(uiMessageSchema).safeParse(parsed);
    return result.success ? (result.data as UIMessage[]) : [];
  } catch {
    return [];
  }
};

export const saveMessages = (
  conversationId: string,
  messages: UIMessage[]
): void => {
  // Enforce maxMessages client-side to prevent unbounded localStorage growth
  const trimmed = messages.slice(-CHAT_CONFIG.maxMessages * 2);
  safeSetItem(
    STORAGE_KEYS.messages(conversationId),
    JSON.stringify(trimmed)
  );
};

// --- Utility ---

export const generateConversationTitle = (firstMessage: string): string => {
  const maxLength = 40;
  const trimmed = firstMessage.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}...`;
};
