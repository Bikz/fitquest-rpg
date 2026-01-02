const readEnv = (key: string, fallback = "") => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};

const readNumber = (key: string, fallback: number) => {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  port: readNumber("PORT", 8787),
  corsOrigin: readEnv("CORS_ORIGIN", "*"),
  database: {
    url: readEnv("DATABASE_URL"),
    ssl: readEnv("DATABASE_SSL", "false") === "true",
    poolMax: readNumber("DATABASE_POOL_MAX", 10),
  },
  ai: {
    mode: readEnv("AI_MODE", "mock"),
    upstreamUrl: readEnv("AI_UPSTREAM_URL"),
    upstreamKey: readEnv("AI_UPSTREAM_KEY"),
    timeoutMs: readNumber("AI_TIMEOUT_MS", 30000),
  },
  app: {
    minVersion: readEnv("APP_MIN_VERSION", "1.0.0"),
    latestVersion: readEnv("APP_LATEST_VERSION", "1.0.0"),
    updateUrl: readEnv("APP_UPDATE_URL"),
    configJson: readEnv("APP_CONFIG_JSON"),
  },
  analytics: {
    mode: readEnv("ANALYTICS_MODE", "log"),
  },
  notifications: {
    mode: readEnv("NOTIFICATIONS_MODE", "log"),
    expoAccessToken: readEnv("EXPO_PUSH_ACCESS_TOKEN"),
    expoPushUrl: readEnv("EXPO_PUSH_URL", "https://exp.host/--/api/v2/push/send"),
  },
  email: {
    mode: readEnv("EMAIL_MODE", "log"),
    defaultFrom: readEnv("EMAIL_DEFAULT_FROM", "no-reply@loveleaf.app"),
  },
  billing: {
    webhookSecret: readEnv("BILLING_WEBHOOK_SECRET"),
    webhookSignatureHeader: readEnv("BILLING_WEBHOOK_SIGNATURE_HEADER", "authorization"),
    webhookSignatureType: readEnv("BILLING_WEBHOOK_SIGNATURE_TYPE", "bearer"),
    provider: readEnv("BILLING_PROVIDER", "default"),
    proEntitlementId: readEnv("BILLING_PRO_ENTITLEMENT_ID", "pro"),
  },
  entitlements: {
    syncMode: readEnv("ENTITLEMENTS_SYNC_MODE", "client"),
  },
  auth: {
    mode: readEnv("AUTH_MODE", "stub"),
    jwksUrl: readEnv("AUTH_JWKS_URL"),
    issuer: readEnv("AUTH_ISSUER"),
    audience: readEnv("AUTH_AUDIENCE"),
  },
  storage: {
    mode: readEnv("STORAGE_MODE", "off"),
    endpoint: readEnv("STORAGE_ENDPOINT"),
    region: readEnv("STORAGE_REGION", "auto"),
    bucket: readEnv("STORAGE_BUCKET"),
    accessKey: readEnv("STORAGE_ACCESS_KEY"),
    secretKey: readEnv("STORAGE_SECRET_KEY"),
    publicBaseUrl: readEnv("STORAGE_PUBLIC_BASE_URL"),
  },
};
