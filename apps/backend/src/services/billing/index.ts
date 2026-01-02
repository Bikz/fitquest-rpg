import { env } from "../../config/env";
import { setEntitlements } from "../../db/queries/entitlements";
import { ensureUser } from "../../db/queries/users";

type BillingEvent = {
  eventId: string;
  userId: string;
  isPro: boolean;
  source: string;
};

const asRecord = (value: unknown) =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const getString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
};

const getBoolean = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return null;
};

const getStringArray = (...values: unknown[]) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string") as string[];
    }
  }
  return [];
};

export const parseBillingWebhook = (payload: Record<string, unknown>): BillingEvent | null => {
  const event = asRecord(payload.event) ?? payload;

  const eventId = getString(event.id, event.event_id, payload.id, payload.event_id);
  const userId = getString(
    event.app_user_id,
    event.appUserId,
    event.original_app_user_id,
    event.originalAppUserId,
    event.user_id,
    event.userId,
    payload.app_user_id,
    payload.user_id,
  );

  const entitlementIds = getStringArray(event.entitlement_ids, payload.entitlement_ids);
  const entitlementId = getString(event.entitlement_id, payload.entitlement_id);

  let isPro: boolean | null = null;
  if (entitlementIds.length > 0) {
    isPro = entitlementIds.includes(env.billing.proEntitlementId);
  } else if (entitlementId) {
    isPro = entitlementId === env.billing.proEntitlementId;
  } else {
    isPro = getBoolean(event.is_pro, payload.is_pro, event.isPro, payload.isPro);
  }

  if (!eventId || !userId || isPro === null) return null;

  return {
    eventId,
    userId,
    isPro,
    source: env.billing.provider,
  };
};

export const applyBillingEvent = async (event: BillingEvent) => {
  await ensureUser(event.userId, null);
  await setEntitlements(event.userId, event.isPro, event.source);
};
