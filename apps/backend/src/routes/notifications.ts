import { Hono } from "hono";
import { ensureUser } from "../db/queries/users";
import { authMiddleware, getAuthContext } from "../middleware/auth";
import { registerPushToken, sendNotification } from "../services/notifications";

type RegisterPayload = Parameters<typeof registerPushToken>[0];
type RegisterRequestPayload = Partial<RegisterPayload>;
type SendPayload = Parameters<typeof sendNotification>[0];
type SendRequestPayload = Partial<SendPayload>;

const notifications = new Hono();

notifications.use("*", authMiddleware);

notifications.post("/register", async (c) => {
  let payload: RegisterRequestPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  const token = payload?.token;
  if (!token) {
    return c.json({ error: "token is required." }, 400);
  }

  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);
  const registerPayload: RegisterPayload = {
    userId: user.id,
    token,
    platform: payload?.platform,
  };
  await registerPushToken(registerPayload);
  return c.json({ ok: true });
});

notifications.post("/send", async (c) => {
  let payload: SendRequestPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  const title = payload?.title;
  const body = payload?.body;
  if (!title || !body) {
    return c.json({ error: "title and body are required." }, 400);
  }

  const user = getAuthContext(c);
  const sendPayload: SendPayload = {
    userId: payload?.userId ?? user.id,
    title,
    body,
    data: payload?.data,
  };
  await sendNotification(sendPayload);
  return c.json({ ok: true });
});

export default notifications;
