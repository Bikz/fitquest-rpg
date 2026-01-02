import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../../config/env";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

const getJwks = () => {
  if (!env.auth.jwksUrl) {
    throw new Error("AUTH_JWKS_URL is not set.");
  }

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(env.auth.jwksUrl));
  }

  return jwks;
};

const parseAudience = () => {
  if (!env.auth.audience) return undefined;
  const values = env.auth.audience
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
};

export const verifyJwt = async (token: string) => {
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer: env.auth.issuer || undefined,
    audience: parseAudience(),
  });

  if (!payload.sub) {
    throw new Error("Token is missing subject.");
  }

  return {
    userId: payload.sub,
    issuer: payload.iss ?? null,
  };
};
