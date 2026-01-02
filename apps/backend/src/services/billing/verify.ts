import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env";

const normalizeHeader = (value?: string | null) => {
  if (!value) return "";
  return value.trim();
};

const safeCompare = (a: string, b: string) => {
  if (!a || !b) return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
};

const extractBearer = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
};

export const verifyWebhookSignature = (rawBody: string, headerValue?: string | null) => {
  const secret = env.billing.webhookSecret;
  if (!secret) return true;

  const signatureType = env.billing.webhookSignatureType.toLowerCase();
  const header = normalizeHeader(headerValue);
  if (!header) return false;

  if (signatureType === "bearer") {
    const token = extractBearer(header);
    return safeCompare(token, secret);
  }

  if (signatureType === "hmac-sha256") {
    const computed = createHmac("sha256", secret).update(rawBody).digest("hex");
    const normalizedHeader = header.replace(/^sha256=/i, "");
    if (safeCompare(normalizedHeader, computed)) return true;
    const computedBase64 = createHmac("sha256", secret).update(rawBody).digest("base64");
    return safeCompare(normalizedHeader, computedBase64);
  }

  return false;
};
