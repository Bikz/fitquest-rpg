import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import { fetchAppVersion } from "@/services/api/app";
import { useApiRequest } from "@/services/api/client";
import { compareVersions } from "@/utils/version";
import type { AppVersionInfo } from "@loveleaf/types";
import Constants from "expo-constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMMKVString } from "react-native-mmkv";

const getCurrentVersion = () => {
  return (
    Constants.expoConfig?.version ||
    Constants.manifest?.version ||
    Constants.manifest2?.extra?.expoClient?.version ||
    "0.0.0"
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
  const [info, setInfo] = useState<AppVersionInfo | null>(parseVersionInfo(stored));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInfo(parseVersionInfo(stored));
  }, [stored]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAppVersion(request);
      storage.set(STORAGE_KEYS.appVersionInfo, JSON.stringify(response));
      setInfo(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to check version.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (!stored) {
      void refresh();
    }
  }, [refresh, stored]);

  const currentVersion = getCurrentVersion();
  const requiresUpdate = info ? compareVersions(currentVersion, info.minVersion) < 0 : false;
  const needsUpdate = info ? compareVersions(currentVersion, info.latestVersion) < 0 : false;

  return useMemo(
    () => ({
      currentVersion,
      info,
      needsUpdate,
      requiresUpdate,
      loading,
      error,
      refresh,
    }),
    [currentVersion, error, info, loading, needsUpdate, refresh, requiresUpdate],
  );
};

export default useAppVersionCheck;
