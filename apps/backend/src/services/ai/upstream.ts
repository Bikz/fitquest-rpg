import type { AiChatResponse, AiMessage, AiProvider } from "./types";

export type UpstreamConfig = {
  url: string;
  apiKey?: string;
  timeoutMs: number;
};

export const createUpstreamProvider = (config: UpstreamConfig): AiProvider => ({
  chat: async (messages: AiMessage[]) => {
    if (!config.url) {
      return { content: "AI upstream is not configured." };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upstream AI request failed.");
      }

      const data = (await response.json()) as Partial<AiChatResponse>;
      return { content: data.content ?? "AI response unavailable." };
    } finally {
      clearTimeout(timeout);
    }
  },
});
