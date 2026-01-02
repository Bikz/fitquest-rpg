import type { UserProfile } from "@loveleaf/types";
import type { ApiRequestOptions } from "./client";

export const fetchUserProfile = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
) => {
  return request<UserProfile>("/users/me");
};

export const upsertUserProfile = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
  payload: { displayName?: string | null; authProvider?: string | null },
) => {
  return request<UserProfile>("/users/me", {
    method: "POST",
    body: payload,
  });
};

export const deleteUserAccount = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
) => {
  return request<{ ok: true }>("/users/me", {
    method: "DELETE",
  });
};
