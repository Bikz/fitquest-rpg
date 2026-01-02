import { Hono } from "hono";
import { env } from "../config/env";
import { recordWebhookEvent } from "../db/queries/webhooks";
import { applyBillingEvent, parseBillingWebhook } from "../services/billing";
import { verifyWebhookSignature } from "../services/billing/verify";

const billing = new Hono();

billing.post("/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signatureHeader = env.billing.webhookSignatureHeader;
  const signature = c.req.header(signatureHeader);

  if (!verifyWebhookSignature(rawBody, signature)) {
    return c.json({ error: "invalid signature" }, 401);
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  const event = parseBillingWebhook(payload ?? {});
  if (!event) {
    return c.json({ error: "Invalid billing payload." }, 400);
  }

  const recorded = await recordWebhookEvent(env.billing.provider, event.eventId);
  if (!recorded) {
    return c.json({ ok: true, duplicate: true });
  }

  await applyBillingEvent(event);
  return c.json({ ok: true });
});

export default billing;
