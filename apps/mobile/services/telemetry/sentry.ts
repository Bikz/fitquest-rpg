import * as Sentry from "sentry-expo";
import { env } from "@/config/env";

let initialized = false;

export const initSentry = () => {
  if (initialized || !env.sentryDsn) return;
  Sentry.init({
    dsn: env.sentryDsn,
    environment: env.appEnv,
    enableInExpoDevelopment: env.appEnv !== "production",
    debug: env.appEnv !== "production",
  });
  initialized = true;
};

export const captureSentryError = (error: Error, context?: Record<string, unknown>) => {
  if (!env.sentryDsn) return;
  Sentry.captureException(error, { extra: context });
};

export const setSentryUser = (userId?: string | null) => {
  if (!env.sentryDsn) return;
  if (userId) {
    Sentry.setUser({ id: userId });
    return;
  }
  Sentry.setUser(null);
};
