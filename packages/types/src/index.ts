export type ApiError = {
  error: string;
  code?: string;
};

export type UserProfile = {
  id: string;
  authProvider: string | null;
  displayName: string | null;
};

export type Entitlements = {
  isPro: boolean;
  source: string | null;
};

export type AiRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiRole;
  content: string;
};

export type AiChatResponse = {
  content: string;
};

export type FilePresignRequest = {
  fileName: string;
  contentType?: string | null;
  size?: number | null;
};

export type FilePresignResponse = {
  fileId: string;
  path: string;
  uploadUrl: string;
  fileUrl: string;
};

export type AppVersionInfo = {
  minVersion: string;
  latestVersion: string;
  updateUrl: string;
};

export type AppConfig = {
  config: Record<string, unknown>;
};
