import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import type { ConfigContext, ExpoConfig } from "expo/config";
import { parseEnv } from "./config/env.schema";

const resolveEnvPath = (appEnv: string) => path.join(__dirname, `.env.${appEnv}`);

const appEnv = process.env.APP_ENV ?? process.env.EXPO_PUBLIC_APP_ENV ?? "development";
const baseEnvPath = path.join(__dirname, ".env");

if (fs.existsSync(baseEnvPath)) {
  loadEnv({ path: baseEnvPath, quiet: true });
}

const envPath = resolveEnvPath(appEnv);
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath, override: true, quiet: true });
}

process.env.EXPO_PUBLIC_APP_ENV ??= appEnv;

const env = parseEnv({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_FEATURE_CHAT: process.env.EXPO_PUBLIC_FEATURE_CHAT,
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
});

const envSuffix = env.EXPO_PUBLIC_APP_ENV === "production" ? "" : env.EXPO_PUBLIC_APP_ENV;
const nameSuffix = envSuffix ? ` (${envSuffix})` : "";
const slugSuffix = envSuffix ? `-${envSuffix}` : "";
const bundleSuffix = envSuffix ? `.${envSuffix}` : "";
const schemeSuffix = envSuffix ? `-${envSuffix}` : "";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: `AppBase${nameSuffix}`,
  slug: `app-base${slugSuffix}`,
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: `app-base${schemeSuffix}`,
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#f8f5f0",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: `com.loveleaf.appbase${bundleSuffix}`,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#f8f5f0",
    },
    package: `com.loveleaf.appbase${bundleSuffix}`,
    permissions: [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.ACCESS_MEDIA_LOCATION",
    ],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 34,
          targetSdkVersion: 34,
        },
        ios: {
          deploymentTarget: "15.1",
        },
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
        isAccessMediaLocationEnabled: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    ...config.extra,
    appEnv: env.EXPO_PUBLIC_APP_ENV,
    router: {
      origin: false,
    },
  },
});
