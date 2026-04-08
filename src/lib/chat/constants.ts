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
    title: "Drug Safety",
    description: "What are the ARIA-E risks with Leqembi and when should MRI monitoring occur?",
    prompt:
      "What safety concerns has the FDA identified for Leqembi (lecanemab), and what MRI monitoring schedule is recommended?",
  },
  {
    title: "Side Effects",
    description: "How does Carbidopa/Levodopa affect vitamin B6 and seizure risk?",
    prompt:
      "What is the connection between Carbidopa/Levodopa, vitamin B6 deficiency, and seizures?",
  },
  {
    title: "GLP-1 Safety Update",
    description: "What did the FDA conclude about GLP-1 medications and suicidal ideation?",
    prompt:
      "What were the FDA's findings on suicidal ideation risk with GLP-1 receptor agonist medications like Wegovy and Zepbound?",
  },
  {
    title: "Essential Medicines",
    description: "Which analgesics are on the WHO Essential Medicines List?",
    prompt:
      "What pain and palliative care medicines are included in the WHO Model List of Essential Medicines?",
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
