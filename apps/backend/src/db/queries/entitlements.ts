import { sql } from "../index";

export type EntitlementsRecord = {
  is_pro: boolean;
  source: string | null;
};

export const getEntitlements = async (userId: string) => {
  const rows = await sql<EntitlementsRecord[]>`
    SELECT is_pro, source
    FROM entitlements
    WHERE user_id = ${userId}
    LIMIT 1;
  `;

  if (rows.length > 0) {
    return rows[0];
  }

  await sql`
    INSERT INTO entitlements (user_id, is_pro, source)
    VALUES (${userId}, false, null)
    ON CONFLICT (user_id) DO NOTHING;
  `;

  return { is_pro: false, source: null };
};

export const setEntitlements = async (userId: string, isPro: boolean, source?: string | null) => {
  const rows = await sql<EntitlementsRecord[]>`
    INSERT INTO entitlements (user_id, is_pro, source)
    VALUES (${userId}, ${isPro}, ${source ?? null})
    ON CONFLICT (user_id) DO UPDATE
      SET is_pro = EXCLUDED.is_pro,
          source = EXCLUDED.source,
          updated_at = NOW()
    RETURNING is_pro, source;
  `;

  return rows[0] ?? { is_pro: isPro, source: source ?? null };
};
