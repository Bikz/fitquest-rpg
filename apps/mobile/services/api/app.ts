import type { AppConfig, AppVersionInfo } from "@loveleaf/types";
import type { ApiRequestOptions } from "./client";

export const fetchAppVersion = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
) => {
  return request<AppVersionInfo>("/app/version");
};

export const fetchAppConfig = async (
  request: <T>(path: string, options?: ApiRequestOptions) => Promise<T>,
) => {
  return request<AppConfig>("/app/config");
};
