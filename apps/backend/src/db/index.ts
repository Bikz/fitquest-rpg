import postgres from "postgres";
import { env } from "../config/env";

if (!env.database.url) {
  console.warn("DATABASE_URL is not set. Backend DB calls will fail.");
}

export const sql = postgres(env.database.url || "postgres://localhost:5432/appbase", {
  ssl: env.database.ssl ? { rejectUnauthorized: false } : undefined,
  max: env.database.poolMax,
});

export type SqlClient = typeof sql;

export const closeDb = async () => {
  await sql.end({ timeout: 5 });
};
