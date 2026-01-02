# AppBase Backend

Minimal Hono API with Postgres, AI proxy, presigned uploads, and stubs for analytics, notifications, email, and billing webhooks.

## Setup

Create `apps/backend/.env` from `.env.example`, then run:

```bash
bun install
bun run backend:migrate
bun run backend:dev
```

Lint:

```bash
bun run backend:lint
```

Tooling:

- Formatting + linting is handled by Biome (`biome.json` at repo root).

`AUTH_MODE=stub` trusts `x-user-id` for local development. Use `AUTH_MODE=jwt` with `AUTH_JWKS_URL`, `AUTH_ISSUER`, and `AUTH_AUDIENCE` for production.
Set `ENTITLEMENTS_SYNC_MODE=server` and configure webhook signature env vars for production billing.

Set `STORAGE_MODE=s3` with S3-compatible credentials (e.g. R2) to enable presigned uploads.
Configure webhook verification via `BILLING_WEBHOOK_SIGNATURE_HEADER` + `BILLING_WEBHOOK_SIGNATURE_TYPE`.
Set `NOTIFICATIONS_MODE=expo` and optionally `EXPO_PUSH_ACCESS_TOKEN` to send pushes via Expo.

## Endpoints

- `GET /health`
- `POST /ai/chat`
- `GET /app/version`
- `GET /app/config`
- `GET /users/me`
- `POST /users/me`
- `DELETE /users/me`
- `GET /entitlements`
- `POST /entitlements/sync`
- `POST /files/presign`
- `POST /analytics`
- `POST /notifications/register`
- `POST /notifications/send`
- `POST /email/send`
- `POST /billing/webhook`
