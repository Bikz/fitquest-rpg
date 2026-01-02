# AppBase Mobile

Cross-platform mobile template with auth, onboarding, billing, AI hooks, and an optional chat module.

## Features

- Auth flows with Apple, Google, and email/password
- Onboarding sequence
- RevenueCat billing integration + test pro toggle
- App-managed AI service client
- Optional chat feature under `app/(chat)`
- Global error boundary + telemetry hooks
- Offline banner + network status hook
- Remote config + version check hooks
- File upload helper (picker → presign → upload)
- Native tabs layout (liquid glass on iOS 26+)
- Glass surfaces via `expo-glass-effect` (see `ui/components/GlassSurface.tsx`)
- Expo push notifications (register from Settings)

## Setup

Create `apps/mobile/.env`:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_FEATURE_CHAT=false
```

Run locally:

```bash
bun install
cd apps/mobile
bun start
```

Set `EXPO_PUBLIC_API_BASE_URL` to your backend base URL (e.g. `http://localhost:8787`).

This template uses `metro.config.js` to enable monorepo workspace packages.

## Liquid Glass Notes (SDK 54+)

- Native tabs use the system tab bar (liquid glass on iOS 26+). Docs: https://docs.expo.dev/versions/latest/sdk/router-native-tabs/
- Expo Router native tabs walkthrough: https://www.youtube.com/watch?v=QqNZXdGFl44
- Use `GlassSurface` when you want a glassy container on iOS and a normal fallback elsewhere (iOS target 15.1+, liquid glass on iOS 26+).
- Native tabs are alpha in SDK 54 and their API may change.

## Push Notifications

- Enable from Settings → Push notifications.
- For EAS builds, set `expo.extra.eas.projectId` so `getExpoPushTokenAsync` can resolve your project.

## Tooling

- Formatting + linting is handled by Biome (`biome.json` at repo root).
