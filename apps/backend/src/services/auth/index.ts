import { env } from "../../config/env";
import { verifyJwt } from "./jwt";

export type AuthUser = {
  id: string;
  authProvider?: string | null;
};

export const authenticateRequest = async (
  authorization?: string | null,
  fallbackUserId?: string | null,
  authProvider?: string | null,
): Promise<AuthUser | null> => {
  const token = authorization?.replace(/^Bearer\s+/i, "").trim() ?? "";

  if (env.auth.mode === "stub") {
    const userId = fallbackUserId || token;
    if (!userId) return null;
    return { id: userId, authProvider: authProvider ?? null };
  }

  if (env.auth.mode === "jwt") {
    if (!token) return null;
    const verified = await verifyJwt(token);
    return { id: verified.userId, authProvider: verified.issuer };
  }

  return null;
};
