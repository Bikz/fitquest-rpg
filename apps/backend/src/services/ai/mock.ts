import type { AiMessage, AiProvider } from "./types";

const pickLastUserMessage = (messages: AiMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i]?.content ?? "";
    }
  }
  return "";
};

export const createMockProvider = (): AiProvider => ({
  chat: async (messages) => {
    const lastUserMessage = pickLastUserMessage(messages);
    const content = lastUserMessage ? `You said: ${lastUserMessage}` : "AI is not configured yet.";
    return { content };
  },
});
