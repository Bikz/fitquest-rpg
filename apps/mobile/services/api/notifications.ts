import type { ApiRequestOptions } from "./client";

type RegisterPayload = {
  token: string;
  platform?: string;
};

export const registerPushToken = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
  payload: RegisterPayload,
) => {
  return request<{ ok: true }>("/notifications/register", {
    method: "POST",
    body: payload,
  });
};
