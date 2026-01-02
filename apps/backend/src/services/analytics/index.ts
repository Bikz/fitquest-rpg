import { env } from "../../config/env";

export const trackEvents = async (events: Array<Record<string, unknown>>, userId?: string) => {
  if (env.analytics.mode === "log") {
    console.log("[analytics]", JSON.stringify({ userId, events }));
  }
};
