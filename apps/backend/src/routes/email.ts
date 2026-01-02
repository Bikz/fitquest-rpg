import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { sendEmail } from "../services/email";

type EmailPayload = Parameters<typeof sendEmail>[0];
type EmailRequestPayload = Partial<EmailPayload>;

const email = new Hono();

email.use("*", authMiddleware);

email.post("/send", async (c) => {
  let payload: EmailRequestPayload | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  const to = payload?.to;
  const subject = payload?.subject;
  if (!to || !subject || (!payload?.text && !payload?.html)) {
    return c.json({ error: "to, subject, and text or html are required." }, 400);
  }

  const safePayload: EmailPayload = {
    to,
    subject,
    text: payload?.text,
    html: payload?.html,
    from: payload?.from,
  };
  await sendEmail(safePayload);
  return c.json({ ok: true });
});

export default email;
