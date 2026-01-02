import { sql } from "../index";

export const upsertDevice = async (record: {
  id: string;
  userId: string;
  token: string;
  platform?: string | null;
}) => {
  await sql`
    INSERT INTO devices (id, user_id, push_token, platform)
    VALUES (${record.id}, ${record.userId}, ${record.token}, ${record.platform ?? null})
    ON CONFLICT (user_id, push_token) DO UPDATE
      SET platform = EXCLUDED.platform,
          created_at = NOW();
  `;
};

export const getUserPushTokens = async (userId: string) => {
  const rows = await sql<{ push_token: string }[]>`
    SELECT push_token
    FROM devices
    WHERE user_id = ${userId};
  `;
  const tokens = rows.map((row) => row.push_token).filter(Boolean);
  return Array.from(new Set(tokens));
};
