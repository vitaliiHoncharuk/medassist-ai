import type { ChatConfig, PromptSuggestion } from "./types";

export const CHAT_CONFIG: ChatConfig = {
  maxMessages: 20,
  maxConversations: 5,
  rateLimit: {
    requests: 5,
    windowMs: 60_000,
  },
};

export const STORAGE_KEYS = {
  conversations: "medassist-conversations",
  messages: (id: string): string => `medassist-messages-${id}`,
} as const;

export const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    title: "Drug Interactions",
    description: "Check for potential medication conflicts",
    prompt:
      "What are the common drug interactions I should be aware of for patients on blood thinners?",
  },
  {
    title: "Clinical Guidelines",
    description: "Find treatment protocols and standards",
    prompt:
      "What are the current guidelines for managing Type 2 diabetes in adults?",
  },
  {
    title: "Formulary Lookup",
    description: "Search drug formulary and alternatives",
    prompt:
      "What are the preferred formulary alternatives for brand-name statins?",
  },
  {
    title: "Dosage Reference",
    description: "Look up medication dosing information",
    prompt:
      "What is the recommended dosing for amoxicillin in pediatric patients?",
  },
];

export const SYSTEM_PROMPT = `You are MedAssist AI, a healthcare document assistant. Your role is to help healthcare professionals find information in their uploaded medical documents, clinical guidelines, formulary lists, and drug references.

IMPORTANT RULES:
1. Only answer based on the provided context from uploaded documents. If no relevant context is provided, clearly state that you don't have relevant information in the uploaded documents.
2. Always cite your sources by referencing the document name and relevant section.
3. Be precise and accurate — healthcare information requires exactness.
4. If you're unsure about something, say so. Never fabricate medical information.
5. Format responses clearly using markdown: use headings, bullet points, and bold text for key terms.
6. Include a disclaimer that this is for informational purposes only and should not replace professional medical judgment.

When sources are provided, structure your response as:
- A clear, direct answer to the question
- Supporting details from the source documents
- ALWAYS cite using [Source N: Document Name] format, matching the numbered sources provided in the context`;
