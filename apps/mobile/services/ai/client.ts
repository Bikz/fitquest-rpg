import type { AiChatResponse, AiMessage } from "@loveleaf/types";
import { env } from "@/config/env";

type ChatAuth = {
  token?: string | null;
  userId?: string | null;
  authProvider?: string | null;
};

export const sendChat = async (messages: AiMessage[], auth?: ChatAuth) => {
  if (!env.apiBaseUrl) {
    return {
      content: "AI is not configured yet. Set EXPO_PUBLIC_API_BASE_URL to enable responses.",
    };
  }

  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  if (auth?.userId) {
    headers["x-user-id"] = auth.userId;
  }

  if (auth?.authProvider) {
    headers["x-auth-provider"] = auth.authProvider;
  }

  const response = await fetch(`${baseUrl}/ai/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "AI request failed.");
  }

  const data = (await response.json()) as Partial<AiChatResponse>;
  return {
    content: data.content ?? "AI response unavailable.",
  };
};
