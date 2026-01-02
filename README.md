# Loveleaf Monorepo

Monorepo with a reusable mobile app base template and shared packages.

## Structure

- `apps/mobile` – mobile app template (onboarding, auth, billing, AI, optional chat)
- `apps/backend` – Hono API template (AI proxy, webhooks, notifications, analytics stubs)
- `packages/types` – shared types for API contracts
- `packages/config` – shared lint/format/tsconfig presets

## Getting Started

```bash
bun install
bun run dev
```

## Requirements

- Node 24.x (avoid Node 25 for now)
- Bun

Mobile app targets Expo SDK 54. See `apps/mobile/README.md` for liquid glass notes.
Tooling presets live in `packages/config`, and shared API types live in `packages/types`.

## Mobile Scripts

```bash
bun run mobile:start
bun run mobile:android
bun run mobile:ios
bun run mobile:web
```

## Backend Scripts

```bash
bun run backend:dev
bun run backend:start
bun run backend:migrate
bun run backend:lint
```

## Lint & Format

```bash
bun run lint
bun run format
bun run format:check
```

## Tooling

- `biome.json` defines formatting + linting.
- `turbo.json` is included if you want task caching later.

## Release Checklist

```bash
bun run release:check
```

## Environment

Create `apps/mobile/.env` with keys for auth, billing, and AI:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_FEATURE_CHAT=false
```

Point `EXPO_PUBLIC_API_BASE_URL` at your backend, for example `http://localhost:8787`.

Create `apps/backend/.env` for API configuration:

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

`AUTH_MODE=stub` trusts `x-user-id` from the client for local dev. Use `AUTH_MODE=jwt` with `AUTH_JWKS_URL`, `AUTH_ISSUER`, and `AUTH_AUDIENCE` in production.

Set `STORAGE_MODE=s3` with S3-compatible credentials (R2 works) to enable presigned uploads.
Set `ENTITLEMENTS_SYNC_MODE=server` and configure webhook signature env vars for production billing.

## Template Utilities

- Global error boundary + telemetry hooks
- Offline banner + network status hook
- Remote config + version check hooks
- File upload helper (picker → presign → upload)
- Expo push registration (optional)

## Chat Feature

The chat feature lives in `apps/mobile/features/chat` and its routes live under `apps/mobile/app/(chat)`.
Set `EXPO_PUBLIC_FEATURE_CHAT=true` to enable chat routes and navigation entry points.
# App-Starter-expo-hono-clerk
