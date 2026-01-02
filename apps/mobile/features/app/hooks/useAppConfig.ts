import { useCallback, useEffect, useMemo, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import { fetchAppConfig } from "@/services/api/app";
import { useApiRequest } from "@/services/api/client";

const parseConfig = (value?: string | null) => {
  if (!value) return {} as Record<string, unknown>;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
};

const useAppConfig = () => {
  const { request } = useApiRequest();
  const [storedConfig] = useMMKVString(STORAGE_KEYS.appConfig, storage);
  const [config, setConfig] = useState<Record<string, unknown>>(parseConfig(storedConfig));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(parseConfig(storedConfig));
  }, [storedConfig]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAppConfig(request);
      const value = JSON.stringify(response.config ?? {});
      storage.set(STORAGE_KEYS.appConfig, value);
      setConfig(response.config ?? {});
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load config.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (!storedConfig) {
      void refresh();
    }
  }, [refresh, storedConfig]);

  return useMemo(() => ({ config, loading, error, refresh }), [config, error, loading, refresh]);
};

export default useAppConfig;
