import { env } from "@/config/env";
import { DEFAULT_RETRY, type RetryOptions, withRetry } from "@/services/api/retry";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useCallback } from "react";

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export type ApiRequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  userId?: string | null;
  authProvider?: string | null;
  headers?: Record<string, string>;
  retry?: boolean | Partial<RetryOptions>;
};

const getBaseUrl = () => {
  if (!env.apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set.");
  }
  return env.apiBaseUrl.replace(/\/$/, "");
};

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const retryOptions =
    options.retry === true
      ? { ...DEFAULT_RETRY }
      : options.retry
        ? { ...DEFAULT_RETRY, ...options.retry }
        : null;
  const baseUrl = getBaseUrl();
  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  let body: string | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.userId) {
    headers["x-user-id"] = options.userId;
  }

  if (options.authProvider) {
    headers["x-auth-provider"] = options.authProvider;
  }

  const execute = async () => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers,
      body,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new ApiRequestError(text || `Request failed: ${response.status}`, response.status);
    }

    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  };

  if (retryOptions) {
    return withRetry(execute, {
      ...retryOptions,
      retryOn:
        retryOptions.retryOn ??
        ((error) => {
          if (error instanceof ApiRequestError) {
            return !error.status || error.status >= 500;
          }
          return true;
        }),
    });
  }

  return execute();
};

export const useApiRequest = () => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const authProvider = user?.externalAccounts?.[0]?.provider;

  const request = useCallback(
    async <T>(path: string, options: ApiRequestOptions = {}) => {
      const token = await getToken();
      return apiRequest<T>(path, {
        ...options,
        token,
        userId: user?.id,
        authProvider: authProvider || options.authProvider,
      });
    },
    [authProvider, getToken, user?.id],
  );

  return { request };
};
