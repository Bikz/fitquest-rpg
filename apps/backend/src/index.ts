import "./config/loadEnv";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./config/env";
import routes from "./routes";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

app.get("/", (c) => c.json({ name: "AppBase API", status: "ok" }));
app.get("/health", (c) => c.json({ ok: true }));

app.route("/", routes);

if (import.meta.main) {
  serve({
    fetch: app.fetch,
    port: env.port,
  });
  console.log(`API listening on http://localhost:${env.port}`);
}

export { app };
