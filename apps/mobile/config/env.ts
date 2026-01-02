import { parseEnv } from "./env.schema";

const parsed = parseEnv({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_FEATURE_CHAT: process.env.EXPO_PUBLIC_FEATURE_CHAT,
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
});

export const env = {
  appEnv: parsed.EXPO_PUBLIC_APP_ENV,
  clerkPublishableKey: parsed.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  apiBaseUrl: parsed.EXPO_PUBLIC_API_BASE_URL,
  featureChat: parsed.EXPO_PUBLIC_FEATURE_CHAT === "true",
  revenueCat: {
    iosApiKey: parsed.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "",
    androidApiKey: parsed.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "",
  },
};
