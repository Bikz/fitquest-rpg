import { env } from "../../config/env";
import { createMockProvider } from "./mock";
import type { AiChatResponse, AiMessage } from "./types";
import { createUpstreamProvider } from "./upstream";

const provider =
  env.ai.mode === "upstream"
    ? createUpstreamProvider({
        url: env.ai.upstreamUrl,
        apiKey: env.ai.upstreamKey,
        timeoutMs: env.ai.timeoutMs,
      })
    : createMockProvider();

export const sendChat = async (messages: AiMessage[]): Promise<AiChatResponse> => {
  return provider.chat(messages);
};
