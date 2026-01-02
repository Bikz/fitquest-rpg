import { Hono } from "hono";
import { env } from "../config/env";
import { getEntitlements, setEntitlements } from "../db/queries/entitlements";
import { ensureUser } from "../db/queries/users";
import { authMiddleware, getAuthContext } from "../middleware/auth";

const entitlements = new Hono();

entitlements.use("*", authMiddleware);

entitlements.get("/", async (c) => {
  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);
  const record = await getEntitlements(user.id);
  return c.json({
    isPro: record.is_pro,
    source: record.source ?? null,
  });
});

entitlements.post("/sync", async (c) => {
  if (env.entitlements.syncMode !== "client") {
    return c.json({ error: "Client sync disabled." }, 403);
  }

  let payload: { isPro?: boolean; source?: string | null } | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  if (typeof payload?.isPro !== "boolean") {
    return c.json({ error: "isPro must be boolean." }, 400);
  }

  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);
  const record = await setEntitlements(user.id, payload.isPro, payload.source ?? "client");
  return c.json({
    isPro: record.is_pro,
    source: record.source ?? null,
  });
});

export default entitlements;
