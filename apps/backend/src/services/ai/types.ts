import type { AiChatResponse, AiMessage } from "@loveleaf/types";

export type AiProvider = {
  chat: (messages: AiMessage[]) => Promise<AiChatResponse>;
};

export type { AiChatResponse, AiMessage };
