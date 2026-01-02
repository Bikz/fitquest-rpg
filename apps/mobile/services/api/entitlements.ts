import type { Entitlements } from "@loveleaf/types";
import type { ApiRequestOptions } from "./client";

export const fetchEntitlements = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
) => {
  return request<Entitlements>("/entitlements");
};

export const syncEntitlements = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
  payload: { isPro: boolean; source?: string },
) => {
  return request<Entitlements>("/entitlements/sync", {
    method: "POST",
    body: payload,
  });
};
