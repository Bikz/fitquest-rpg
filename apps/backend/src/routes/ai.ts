import { Hono } from "hono";
import { ensureUser } from "../db/queries/users";
import { authMiddleware, getAuthContext } from "../middleware/auth";
import { sendChat } from "../services/ai";
import type { AiMessage } from "../services/ai/types";

const ai = new Hono();

ai.use("*", authMiddleware);

ai.post("/chat", async (c) => {
  let payload: { messages?: AiMessage[] } | null = null;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  if (!payload?.messages || !Array.isArray(payload.messages)) {
    return c.json({ error: "messages must be an array." }, 400);
  }

  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);

  const response = await sendChat(payload.messages);
  return c.json(response);
});

export default ai;
