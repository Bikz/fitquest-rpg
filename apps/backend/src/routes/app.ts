import { Hono } from "hono";
import { env } from "../config/env";

const app = new Hono();

app.get("/version", (c) => {
  return c.json({
    minVersion: env.app.minVersion,
    latestVersion: env.app.latestVersion,
    updateUrl: env.app.updateUrl,
  });
});

app.get("/config", (c) => {
  let config: Record<string, unknown> = {};
  if (env.app.configJson) {
    try {
      config = JSON.parse(env.app.configJson);
    } catch {
      config = {};
    }
  }

  return c.json({ config });
});

export default app;
