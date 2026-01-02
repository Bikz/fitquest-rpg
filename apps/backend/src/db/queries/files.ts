import { sql } from "../index";

export type FileRecord = {
  id: string;
  user_id: string;
  path: string;
  mime: string | null;
  size: number | null;
  created_at: string;
};

export const createFileRecord = async (record: {
  id: string;
  userId: string;
  path: string;
  mime?: string | null;
  size?: number | null;
}) => {
  const rows = await sql<FileRecord[]>`
    INSERT INTO files (id, user_id, path, mime, size)
    VALUES (${record.id}, ${record.userId}, ${record.path}, ${record.mime ?? null}, ${record.size ?? null})
    RETURNING id, user_id, path, mime, size, created_at;
  `;
  return rows[0];
};
