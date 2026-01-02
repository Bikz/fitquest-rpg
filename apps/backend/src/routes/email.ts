import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { sendEmail } from "../services/email";

type EmailPayload = {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  from?: string;
};

const email = new Hono();

email.use("*", authMiddleware);

email.post("/send", async (c) => {
  let payload: EmailPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  if (!payload?.to || !payload?.subject || (!payload?.text && !payload?.html)) {
    return c.json({ error: "to, subject, and text or html are required." }, 400);
  }

  await sendEmail(payload);
  return c.json({ ok: true });
});

export default email;
