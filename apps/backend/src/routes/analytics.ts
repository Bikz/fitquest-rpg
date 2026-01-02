import { Hono } from "hono";
import { authMiddleware, getAuthContext } from "../middleware/auth";
import { trackEvents } from "../services/analytics";

type AnalyticsPayload = {
  events?: Array<Record<string, unknown>>;
};

const analytics = new Hono();

analytics.use("*", authMiddleware);

analytics.post("", async (c) => {
  let payload: AnalyticsPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  const events = payload?.events;
  if (!events || !Array.isArray(events)) {
    return c.json({ error: "events must be an array." }, 400);
  }

  const user = getAuthContext(c);
  await trackEvents(events, user.id);
  return c.json({ ok: true });
});

export default analytics;
