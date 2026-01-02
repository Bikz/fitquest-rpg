import type { AppVersionInfo } from "@loveleaf/types";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";
import { useCallback, useMemo } from "react";
import { useMMKVString } from "react-native-mmkv";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import { fetchAppVersion } from "@/services/api/app";
import { useApiRequest } from "@/services/api/client";
import { compareVersions } from "@/utils/version";

const getCurrentVersion = () => {
  return (
    Constants.expoConfig?.version || Constants.manifest2?.extra?.expoClient?.version || "0.0.0"
  );
};

const parseVersionInfo = (value?: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value) as AppVersionInfo;
  } catch {
    return null;
  }
};

const useAppVersionCheck = () => {
  const { request } = useApiRequest();
  const [stored] = useMMKVString(STORAGE_KEYS.appVersionInfo, storage);
  const cachedInfo = useMemo(() => parseVersionInfo(stored), [stored]);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["appVersionInfo"],
    queryFn: async () => {
      const response = await fetchAppVersion(request);
      storage.set(STORAGE_KEYS.appVersionInfo, JSON.stringify(response));
      return response;
    },
    initialData: stored ? (cachedInfo ?? undefined) : undefined,
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to check version."
    : null;

  const currentVersion = getCurrentVersion();
  const info = data ?? cachedInfo;
  const requiresUpdate = info ? compareVersions(currentVersion, info.minVersion) < 0 : false;
  const needsUpdate = info ? compareVersions(currentVersion, info.latestVersion) < 0 : false;

  return useMemo(
    () => ({
      currentVersion,
      info,
      needsUpdate,
      requiresUpdate,
      loading: isFetching,
      error: errorMessage,
      refresh,
    }),
    [currentVersion, errorMessage, info, isFetching, needsUpdate, refresh, requiresUpdate],
  );
};

export default useAppVersionCheck;
