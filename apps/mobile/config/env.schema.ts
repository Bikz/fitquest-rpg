import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required."),
  EXPO_PUBLIC_API_BASE_URL: z.string().url("EXPO_PUBLIC_API_BASE_URL must be a valid URL."),
  EXPO_PUBLIC_FEATURE_CHAT: z.enum(["true", "false"]).default("false"),
  EXPO_PUBLIC_REVENUECAT_IOS_API_KEY: z.string().optional(),
  EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: z.string().optional(),
});

export type MobileEnv = z.infer<typeof envSchema>;

const formatZodError = (error: z.ZodError) => {
  return error.errors
    .map((issue) =>
      issue.path.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
    )
    .join("\n");
};

export const parseEnv = (values: Record<string, string | undefined>) => {
  const result = envSchema.safeParse(values);
  if (!result.success) {
    throw new Error(formatZodError(result.error));
  }
  return result.data;
};
