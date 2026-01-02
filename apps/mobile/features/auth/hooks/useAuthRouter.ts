import { STORAGE_KEYS } from "@/data/storage/keys";
import { storage } from "@/data/storage/kv";
import { useAuth } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const useAuthRouter = () => {
  const { isLoaded: authDataLoaded, isSignedIn } = useAuth();
  const [hasOnboarded] = useMMKVBoolean(STORAGE_KEYS.onboardingComplete, storage);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!authDataLoaded) return;

    const root = segments[0] ?? "";
    const inAppGroup = root === "(app)";
    const inChatGroup = root === "(chat)";
    const inAuthGroup = root === "(auth)";
    const inOnboarding = root === "onboarding";

    if (!isSignedIn && !hasOnboarded && !inOnboarding && !inAuthGroup) {
      router.replace("/onboarding");
      return;
    }

    if (!isSignedIn && (inAppGroup || inChatGroup)) {
      router.replace("/");
      return;
    }

    if (isSignedIn && !inAppGroup && !inChatGroup) {
      router.replace("/(app)/(tabs)/home");
    }
  }, [authDataLoaded, hasOnboarded, isSignedIn, router, segments]);

  return { authDataLoaded, isSignedIn };
};

export default useAuthRouter;
