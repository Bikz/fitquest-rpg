# Loveleaf App Template

Production-ready monorepo starter for building Expo mobile apps with a Hono API backend.
Includes auth, onboarding, billing, i18n, quality tooling, and a ready-to-extend project structure.

## Stack

- Expo SDK 54 + Expo Router
- Hono backend (Bun runtime)
- Clerk auth (email code and OAuth)
- RevenueCat billing
- TanStack Query + React Hook Form + Zod
- i18next localization
- MMKV + SQLite for local persistence
- Biome + TypeScript + Turbo + Knip
- Maestro E2E + Jest unit tests
- Husky + lint-staged
- Optional Sentry error monitoring

## Features

- Onboarding flow with animations and haptics
- Email code auth + OAuth (Apple/Google)
- Billing paywall + entitlements
- Remote config + version check
- Optional chat feature
- Offline banner + network status hooks
- File upload helper (picker -> presign -> upload)
- Expo push notifications

## Structure

- `apps/mobile` - mobile app template
- `apps/backend` - Hono API template
- `packages/types` - shared API types
- `packages/config` - shared lint/format/tsconfig presets

## Getting Started

```bash
bun install
bun run dev:all
```

## Requirements

- Node 24.x
- Bun

## Environment

### Mobile

Create `apps/mobile/.env` (or `.env.development`, `.env.staging`, `.env.production`):

```
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_FEATURE_CHAT=false
EXPO_PUBLIC_FEATURE_DEV_AUTH_BYPASS=false
EXPO_PUBLIC_SENTRY_DSN=
```

`EXPO_PUBLIC_FEATURE_DEV_AUTH_BYPASS` exposes a dev-only bypass button for E2E.
Set `EXPO_PUBLIC_SENTRY_DSN` to enable Sentry.

### Backend

Create `apps/backend/.env`:

```
PORT=8787
CORS_ORIGIN=*
DATABASE_URL=
DATABASE_SSL=false
DATABASE_POOL_MAX=10
AI_MODE=mock
AI_UPSTREAM_URL=
AI_UPSTREAM_KEY=
APP_MIN_VERSION=1.0.0
APP_LATEST_VERSION=1.0.0
APP_UPDATE_URL=
APP_CONFIG_JSON=
ANALYTICS_MODE=log
NOTIFICATIONS_MODE=log
EMAIL_MODE=log
EMAIL_DEFAULT_FROM=no-reply@loveleaf.app
BILLING_WEBHOOK_SECRET=
BILLING_WEBHOOK_SIGNATURE_HEADER=authorization
BILLING_WEBHOOK_SIGNATURE_TYPE=bearer
BILLING_PROVIDER=default
BILLING_PRO_ENTITLEMENT_ID=pro
ENTITLEMENTS_SYNC_MODE=client
AUTH_MODE=stub
AUTH_JWKS_URL=
AUTH_ISSUER=
AUTH_AUDIENCE=
STORAGE_MODE=off
STORAGE_ENDPOINT=
STORAGE_REGION=auto
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_PUBLIC_BASE_URL=
```

Run migrations after configuring the database:

```bash
bun run backend:migrate
```

Notes:
- `AUTH_MODE=stub` trusts `x-user-id` for local dev. Use `AUTH_MODE=jwt` in production.
- Set `STORAGE_MODE=s3` with S3-compatible credentials to enable presigned uploads.
- Set `ENTITLEMENTS_SYNC_MODE=server` and configure billing webhooks for production.

## Scripts

Mobile:
```bash
bun run mobile:start
bun run mobile:android
bun run mobile:ios
bun run mobile:web
```

Backend:
```bash
bun run backend:dev
bun run backend:start
bun run backend:migrate
bun run backend:lint
```

## Quality

```bash
bun run lint
bun run typecheck
bun run knip
bun run test
```

E2E (Maestro):
```bash
bun run mobile:e2e
```

Maestro requires a Java runtime (Temurin recommended) for the CLI.

## Tooling Notes

- `biome.json` defines formatting and linting.
- `turbo.json` is included if you want task caching later.
