import { Platform } from "react-native";
import type { MMKV as MMKVInstance } from "react-native-mmkv";
import { MMKV } from "react-native-mmkv";

const createWebStorage = (): MMKVInstance => {
  const data = new Map<string, boolean | number | string | ArrayBuffer>();
  const listeners = new Set<(key: string) => void>();

  const notify = (key: string) => {
    for (const listener of listeners) {
      listener(key);
    }
  };

  const webStorage = {
    id: "com.loveleaf.appbase.web",
    size: 0,
    isReadOnly: false,
    set: (key: string, value: boolean | number | string | ArrayBuffer) => {
      data.set(key, value);
      webStorage.size = data.size;
      notify(key);
    },
    getBoolean: (key: string) => {
      const value = data.get(key);
      return typeof value === "boolean" ? value : undefined;
    },
    getString: (key: string) => {
      const value = data.get(key);
      return typeof value === "string" ? value : undefined;
    },
    getNumber: (key: string) => {
      const value = data.get(key);
      return typeof value === "number" ? value : undefined;
    },
    getBuffer: (key: string) => {
      const value = data.get(key);
      return value instanceof ArrayBuffer ? value : undefined;
    },
    contains: (key: string) => data.has(key),
    remove: (key: string) => {
      const removed = data.delete(key);
      if (removed) {
        webStorage.size = data.size;
        notify(key);
      }
      return removed;
    },
    getAllKeys: () => Array.from(data.keys()),
    clearAll: () => {
      if (data.size === 0) {
        return;
      }
      const keys = Array.from(data.keys());
      data.clear();
      webStorage.size = 0;
      for (const key of keys) {
        notify(key);
      }
    },
    recrypt: () => {},
    trim: () => {},
    addOnValueChangedListener: (onValueChanged: (key: string) => void) => {
      listeners.add(onValueChanged);
      return {
        remove: () => listeners.delete(onValueChanged),
      };
    },
    importAllFrom: () => 0,
  };

  return webStorage as MMKVInstance;
};

const canUseNativeStorage = Platform.OS !== "web" && typeof MMKV === "function";

export const storage = canUseNativeStorage
  ? new MMKV({
      id: "com.loveleaf.appbase",
    })
  : createWebStorage();
