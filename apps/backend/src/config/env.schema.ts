import { z } from "zod";

const envSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  CORS_ORIGIN: z.string().default("*"),
  DATABASE_URL: z.string().default(""),
  DATABASE_SSL: z.enum(["true", "false"]).default("false"),
  DATABASE_POOL_MAX: z.coerce.number().int().default(10),
  AI_MODE: z.string().default("mock"),
  AI_UPSTREAM_URL: z.string().default(""),
  AI_UPSTREAM_KEY: z.string().default(""),
  AI_TIMEOUT_MS: z.coerce.number().int().default(30000),
  APP_MIN_VERSION: z.string().default("1.0.0"),
  APP_LATEST_VERSION: z.string().default("1.0.0"),
  APP_UPDATE_URL: z.string().default(""),
  APP_CONFIG_JSON: z.string().default(""),
  ANALYTICS_MODE: z.string().default("log"),
  NOTIFICATIONS_MODE: z.string().default("log"),
  EXPO_PUSH_ACCESS_TOKEN: z.string().default(""),
  EXPO_PUSH_URL: z.string().default("https://exp.host/--/api/v2/push/send"),
  EMAIL_MODE: z.string().default("log"),
  EMAIL_DEFAULT_FROM: z.string().default("no-reply@loveleaf.app"),
  BILLING_WEBHOOK_SECRET: z.string().default(""),
  BILLING_WEBHOOK_SIGNATURE_HEADER: z.string().default("authorization"),
  BILLING_WEBHOOK_SIGNATURE_TYPE: z.string().default("bearer"),
  BILLING_PROVIDER: z.string().default("default"),
  BILLING_PRO_ENTITLEMENT_ID: z.string().default("pro"),
  ENTITLEMENTS_SYNC_MODE: z.string().default("client"),
  AUTH_MODE: z.string().default("stub"),
  AUTH_JWKS_URL: z.string().default(""),
  AUTH_ISSUER: z.string().default(""),
  AUTH_AUDIENCE: z.string().default(""),
  STORAGE_MODE: z.string().default("off"),
  STORAGE_ENDPOINT: z.string().default(""),
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_BUCKET: z.string().default(""),
  STORAGE_ACCESS_KEY: z.string().default(""),
  STORAGE_SECRET_KEY: z.string().default(""),
  STORAGE_PUBLIC_BASE_URL: z.string().default(""),
});

export type BackendEnv = z.infer<typeof envSchema>;

const formatZodError = (error: z.ZodError) => {
  return error.errors
    .map((issue) =>
      issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
    )
    .join("\n");
};

export const parseEnv = (values: Record<string, string | undefined>) => {
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value === "" ? undefined : value]),
  );
  const result = envSchema.safeParse(normalized);
  if (!result.success) {
    throw new Error(formatZodError(result.error));
  }
  return result.data;
};
