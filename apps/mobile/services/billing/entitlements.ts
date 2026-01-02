import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";

export const setRcIsPro = (isPro: boolean) => {
  storage.set(STORAGE_KEYS.rcIsPro, isPro);
};
