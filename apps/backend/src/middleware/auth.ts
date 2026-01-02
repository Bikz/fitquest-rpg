import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { type AuthUser, authenticateRequest } from "../services/auth";

export const authMiddleware = createMiddleware(async (c: Context, next) => {
  let user: AuthUser | null = null;
  try {
    user = await authenticateRequest(
      c.req.header("authorization"),
      c.req.header("x-user-id"),
      c.req.header("x-auth-provider"),
    );
  } catch {
    return c.json({ error: "unauthorized" }, 401);
  }

  if (!user) {
    return c.json({ error: "unauthorized" }, 401);
  }

  c.set("user", user);
  await next();
});

export const getAuthContext = (c: Context) => {
  return c.get("user") as AuthUser;
};
