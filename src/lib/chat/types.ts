export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatConfig = {
  maxMessages: number;
  maxConversations: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
};

export type PromptSuggestion = {
  title: string;
  description: string;
  prompt: string;
};

export type SourceInfo = {
  documentName: string;
  excerpt: string;
};
