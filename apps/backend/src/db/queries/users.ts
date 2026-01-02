import { sql } from "../index";

export type UserRecord = {
  id: string;
  auth_provider: string | null;
  display_name: string | null;
};

export const ensureUser = async (id: string, authProvider?: string | null) => {
  await sql`
    INSERT INTO users (id, auth_provider)
    VALUES (${id}, ${authProvider ?? null})
    ON CONFLICT (id) DO UPDATE
      SET auth_provider = COALESCE(EXCLUDED.auth_provider, users.auth_provider);
  `;
};

export const getUserProfile = async (id: string) => {
  const rows = await sql<UserRecord[]>`
    SELECT users.id,
           users.auth_provider,
           user_profiles.display_name
    FROM users
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE users.id = ${id}
    LIMIT 1;
  `;
  return rows[0] ?? null;
};

export const upsertUserProfile = async (id: string, displayName: string | null) => {
  await sql`
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (${id}, ${displayName})
    ON CONFLICT (user_id) DO UPDATE
      SET display_name = EXCLUDED.display_name,
          updated_at = NOW();
  `;
};

export const deleteUserAccount = async (id: string) => {
  await sql`
    DELETE FROM users
    WHERE id = ${id};
  `;
};
