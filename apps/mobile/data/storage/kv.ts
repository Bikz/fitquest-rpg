import { Platform } from "react-native";
import { createMMKV, type MMKV } from "react-native-mmkv";

const createWebStorage = (): MMKV => {
  const data = new Map<string, boolean | number | string | ArrayBuffer>();
  const listeners = new Set<(key: string) => void>();

  const notify = (key: string) => {
    for (const listener of listeners) {
      listener(key);
    }
  };

  const webStorage: MMKV = {
    name: "MMKVWebStorage",
    id: "com.loveleaf.appbase.web",
    get size() {
      return data.size;
    },
    isReadOnly: false,
    toString: () => "[MMKV WebStorage]",
    equals: (other) => other === webStorage,
    dispose: () => {},
    set: (key: string, value: boolean | number | string | ArrayBuffer) => {
      data.set(key, value);
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
    importAllFrom: (other: MMKV) => {
      const keys = other.getAllKeys();
      for (const key of keys) {
        const value =
          other.getString(key) ??
          other.getNumber(key) ??
          other.getBoolean(key) ??
          other.getBuffer(key);
        if (value !== undefined) {
          webStorage.set(key, value);
        }
      }
      return keys.length;
    },
  };

  return webStorage;
};

const canUseNativeStorage = Platform.OS !== "web";

export const storage = canUseNativeStorage
  ? createMMKV({
      id: "com.loveleaf.appbase",
    })
  : createWebStorage();
