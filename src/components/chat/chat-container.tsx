"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactElement,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { EmptyState } from "./empty-state";
import { ErrorBoundary, ErrorFallback } from "./error-boundary";
import {
  getConversations,
  createConversation,
  getMessages,
  saveMessages,
  updateConversation,
  generateConversationTitle,
} from "@/lib/chat/storage";

const transport = new DefaultChatTransport({ api: "/api/chat" });

/**
 * Get the initial conversation ID from localStorage, if one exists.
 */
const getInitialConversationId = (): string | null => {
  if (typeof window === "undefined") return null;
  const stored = getConversations();
  return stored.length > 0 && stored[0] ? stored[0].id : null;
};

const ChatContainer = (): ReactElement => {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(getInitialConversationId);
  const [input, setInput] = useState("");
  const hasLoadedRef = useRef(false);

  const activeConversationIdRef = useRef<string | null>(activeConversationId);
  const titleUpdatedRef = useRef(false);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    onError: () => {
      // Error is handled via the error state returned by useChat
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Load stored messages for initial conversation — runs once after mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const currentId = activeConversationIdRef.current;
    if (currentId) {
      const storedMessages = getMessages(currentId);
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
        titleUpdatedRef.current = true;
      }
    }
  }, [setMessages]);

  // Persist messages when they change
  useEffect(() => {
    const currentId = activeConversationIdRef.current;
    if (!currentId || messages.length === 0) return;

    saveMessages(currentId, messages);

    if (
      !titleUpdatedRef.current &&
      messages.length >= 1 &&
      messages[0]?.role === "user"
    ) {
      const firstUserText =
        messages[0].parts
          ?.filter(
            (p): p is Extract<typeof p, { type: "text" }> => p.type === "text"
          )
          .map((p) => p.text)
          .join("") ?? "";
      if (firstUserText) {
        const title = generateConversationTitle(firstUserText);
        updateConversation(currentId, { title });
        titleUpdatedRef.current = true;
      }
    }
  }, [messages]);

  const ensureConversation = useCallback((): string => {
    let conversationId = activeConversationIdRef.current;
    if (!conversationId) {
      const conversation = createConversation("New conversation");
      conversationId = conversation.id;
      setActiveConversationId(conversationId);
      activeConversationIdRef.current = conversationId;
      titleUpdatedRef.current = false;
    }
    return conversationId;
  }, []);

  const handleSendMessage = useCallback((): void => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    ensureConversation();
    sendMessage({ text: trimmed });
    setInput("");
  }, [input, isStreaming, ensureConversation, sendMessage]);

  const handleSelectPrompt = useCallback(
    (prompt: string): void => {
      ensureConversation();
      sendMessage({ text: prompt });
    },
    [ensureConversation, sendMessage]
  );

  const handleErrorReset = useCallback((): void => {
    setMessages([]);
  }, [setMessages]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ChatHeader />

      <main className="flex min-h-0 flex-1 flex-col">
        <ErrorBoundary onReset={handleErrorReset}>
          {error ? (
            <ErrorFallback onReset={handleErrorReset} />
          ) : messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSelectPrompt} />
          ) : (
            <MessageList messages={messages} isStreaming={isStreaming} />
          )}
        </ErrorBoundary>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSendMessage}
          isDisabled={isStreaming}
        />
      </main>
    </div>
  );
};

export { ChatContainer };
