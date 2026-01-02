import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
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
  const cachedConfig = useMemo(() => parseConfig(storedConfig), [storedConfig]);

  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["appConfig"],
    queryFn: async () => {
      const response = await fetchAppConfig(request);
      const value = JSON.stringify(response.config ?? {});
      storage.set(STORAGE_KEYS.appConfig, value);
      return response.config ?? {};
    },
    initialData: storedConfig ? cachedConfig : undefined,
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to load config."
    : null;

  return useMemo(
    () => ({
      config: data ?? cachedConfig,
      loading: isFetching,
      error: errorMessage,
      refresh,
    }),
    [cachedConfig, data, errorMessage, isFetching, refresh],
  );
};

export default useAppConfig;
