import { parseEnv } from "./env.schema";

const parsed = parseEnv(process.env);

export const env = {
  appEnv: parsed.APP_ENV,
  port: parsed.PORT,
  corsOrigin: parsed.CORS_ORIGIN,
  database: {
    url: parsed.DATABASE_URL,
    ssl: parsed.DATABASE_SSL === "true",
    poolMax: parsed.DATABASE_POOL_MAX,
  },
  ai: {
    mode: parsed.AI_MODE,
    upstreamUrl: parsed.AI_UPSTREAM_URL,
    upstreamKey: parsed.AI_UPSTREAM_KEY,
    timeoutMs: parsed.AI_TIMEOUT_MS,
  },
  app: {
    minVersion: parsed.APP_MIN_VERSION,
    latestVersion: parsed.APP_LATEST_VERSION,
    updateUrl: parsed.APP_UPDATE_URL,
    configJson: parsed.APP_CONFIG_JSON,
  },
  analytics: {
    mode: parsed.ANALYTICS_MODE,
  },
  notifications: {
    mode: parsed.NOTIFICATIONS_MODE,
    expoAccessToken: parsed.EXPO_PUSH_ACCESS_TOKEN,
    expoPushUrl: parsed.EXPO_PUSH_URL,
  },
  email: {
    mode: parsed.EMAIL_MODE,
    defaultFrom: parsed.EMAIL_DEFAULT_FROM,
  },
  billing: {
    webhookSecret: parsed.BILLING_WEBHOOK_SECRET,
    webhookSignatureHeader: parsed.BILLING_WEBHOOK_SIGNATURE_HEADER,
    webhookSignatureType: parsed.BILLING_WEBHOOK_SIGNATURE_TYPE,
    provider: parsed.BILLING_PROVIDER,
    proEntitlementId: parsed.BILLING_PRO_ENTITLEMENT_ID,
  },
  entitlements: {
    syncMode: parsed.ENTITLEMENTS_SYNC_MODE,
  },
  auth: {
    mode: parsed.AUTH_MODE,
    jwksUrl: parsed.AUTH_JWKS_URL,
    issuer: parsed.AUTH_ISSUER,
    audience: parsed.AUTH_AUDIENCE,
  },
  storage: {
    mode: parsed.STORAGE_MODE,
    endpoint: parsed.STORAGE_ENDPOINT,
    region: parsed.STORAGE_REGION,
    bucket: parsed.STORAGE_BUCKET,
    accessKey: parsed.STORAGE_ACCESS_KEY,
    secretKey: parsed.STORAGE_SECRET_KEY,
    publicBaseUrl: parsed.STORAGE_PUBLIC_BASE_URL,
  },
};
