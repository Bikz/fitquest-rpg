import { sql } from "../index";

export const recordWebhookEvent = async (provider: string, eventId: string) => {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO webhook_events (id, provider)
    VALUES (${eventId}, ${provider})
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  `;

  return rows.length > 0;
};
