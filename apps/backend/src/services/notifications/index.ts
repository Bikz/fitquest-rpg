import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { getUserPushTokens, upsertDevice } from "../../db/queries/devices";

type RegisterPayload = {
  userId: string;
  token: string;
  platform?: string;
};

type SendPayload = {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export const registerPushToken = async (payload: RegisterPayload) => {
  await upsertDevice({
    id: randomUUID(),
    userId: payload.userId,
    token: payload.token,
    platform: payload.platform,
  });

  if (env.notifications.mode === "log") {
    console.log("[notifications:register]", payload);
  }
};

export const sendNotification = async (payload: SendPayload) => {
  if (env.notifications.mode === "log") {
    console.log("[notifications:send]", payload);
    return;
  }

  if (env.notifications.mode !== "expo") {
    return;
  }

  const tokens = await getUserPushTokens(payload.userId);
  if (tokens.length === 0) {
    return;
  }

  const validTokens = tokens.filter((token) =>
    /^ExponentPushToken\\[.+\\]$|^ExpoPushToken\\[.+\\]$/.test(token),
  );

  if (validTokens.length === 0) {
    return;
  }

  const messages = validTokens.map((token) => ({
    to: token,
    title: payload.title,
    body: payload.body,
    data: payload.data,
  }));

  const chunkSize = 100;
  for (let i = 0; i < messages.length; i += chunkSize) {
    const chunk = messages.slice(i, i + chunkSize);
    const response = await fetch(env.notifications.expoPushUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.notifications.expoAccessToken
          ? { Authorization: `Bearer ${env.notifications.expoAccessToken}` }
          : {}),
      },
      body: JSON.stringify(chunk),
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn("[notifications:send] failed", response.status, body);
    }
  }
};
