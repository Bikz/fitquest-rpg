import { FEATURES } from "@/config/features";
import { migrateChatTables } from "@/features/chat/data/chatDatabase";
import type { SQLiteDatabase } from "expo-sqlite/next";

const DATABASE_VERSION = 2;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
    `);
    currentDbVersion = 1;
  }

  if (currentDbVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT,
        created_at INTEGER NOT NULL
      );
    `);
    currentDbVersion = 2;
  }

  if (FEATURES.chat) {
    await migrateChatTables(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function upsertUserProfile(
  db: SQLiteDatabase,
  { id, displayName, createdAt }: { id: string; displayName: string; createdAt: number },
) {
  await db.runAsync(
    `INSERT INTO user_profiles (id, display_name, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`,
    id,
    displayName,
    createdAt,
  );
}

export async function getUserProfile(db: SQLiteDatabase, id: string) {
  return db.getFirstAsync<{ id: string; display_name: string | null }>(
    "SELECT id, display_name FROM user_profiles WHERE id = ?",
    id,
  );
}
