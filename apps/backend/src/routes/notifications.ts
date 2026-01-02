import { Hono } from "hono";
import { ensureUser } from "../db/queries/users";
import { authMiddleware, getAuthContext } from "../middleware/auth";
import { registerPushToken, sendNotification } from "../services/notifications";

type RegisterPayload = {
  token?: string;
  platform?: string;
};

type SendPayload = {
  userId?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
};

const notifications = new Hono();

notifications.use("*", authMiddleware);

notifications.post("/register", async (c) => {
  let payload: RegisterPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  if (!payload?.token) {
    return c.json({ error: "token is required." }, 400);
  }

  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);
  await registerPushToken({ ...payload, userId: user.id });
  return c.json({ ok: true });
});

notifications.post("/send", async (c) => {
  let payload: SendPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  if (!payload?.title || !payload?.body) {
    return c.json({ error: "title and body are required." }, 400);
  }

  const user = getAuthContext(c);
  await sendNotification({ ...payload, userId: payload.userId ?? user.id });
  return c.json({ ok: true });
});

export default notifications;
