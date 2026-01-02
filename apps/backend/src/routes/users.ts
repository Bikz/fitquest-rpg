import { Hono } from "hono";
import {
  deleteUserAccount,
  ensureUser,
  getUserProfile,
  upsertUserProfile,
} from "../db/queries/users";
import { authMiddleware, getAuthContext } from "../middleware/auth";

const users = new Hono();

users.use("*", authMiddleware);

users.get("/me", async (c) => {
  const user = getAuthContext(c);
  await ensureUser(user.id, user.authProvider ?? null);
  const profile = await getUserProfile(user.id);
  return c.json({
    id: user.id,
    authProvider: profile?.auth_provider ?? null,
    displayName: profile?.display_name ?? null,
  });
});

users.post("/me", async (c) => {
  const user = getAuthContext(c);
  let payload: { displayName?: string | null; authProvider?: string | null } | null = null;

  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON payload." }, 400);
  }

  await ensureUser(user.id, payload?.authProvider ?? user.authProvider ?? null);
  if (payload?.displayName !== undefined) {
    await upsertUserProfile(user.id, payload.displayName);
  }

  const profile = await getUserProfile(user.id);
  return c.json({
    id: user.id,
    authProvider: profile?.auth_provider ?? null,
    displayName: profile?.display_name ?? null,
  });
});

users.delete("/me", async (c) => {
  const user = getAuthContext(c);
  await deleteUserAccount(user.id);
  return c.json({ ok: true });
});

export default users;
