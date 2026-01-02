import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import { useMMKVBoolean } from "react-native-mmkv";

export const useEntitlements = () => {
  const [rcIsPro] = useMMKVBoolean(STORAGE_KEYS.rcIsPro, storage);
  const [testProEnabled] = useMMKVBoolean(STORAGE_KEYS.testProEnabled, storage);

  return {
    rcIsPro: Boolean(rcIsPro),
    testProEnabled: Boolean(testProEnabled),
    isPro: Boolean(rcIsPro) || Boolean(testProEnabled),
  };
};
