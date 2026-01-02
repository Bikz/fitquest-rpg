import type { SQLiteDatabase } from "expo-sqlite";
import { type Message, Role } from "@/features/chat/models/messages";

export async function migrateChatTables(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY NOT NULL,
      chat_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      imageUrl TEXT,
      role TEXT,
      prompt TEXT,
      FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
    );
  `);
}

export const addChat = async (db: SQLiteDatabase, title: string) => {
  return await db.runAsync("INSERT INTO chats (title) VALUES (?)", title);
};

export const getChats = async (db: SQLiteDatabase) => {
  return await db.getAllAsync("SELECT * FROM chats");
};

export const getMessages = async (db: SQLiteDatabase, chatId: number): Promise<Message[]> => {
  return (await db.getAllAsync<Message>("SELECT * FROM messages WHERE chat_id = ?", chatId)).map(
    (message: Message) => ({
      ...message,
      role: `${message.role}` === "bot" ? Role.Bot : Role.User,
    }),
  );
};

export const addMessage = async (
  db: SQLiteDatabase,
  chatId: number,
  { content, role, imageUrl, prompt }: Message,
) => {
  return await db.runAsync(
    "INSERT INTO messages (chat_id, content, role, imageUrl, prompt) VALUES (?, ?, ?, ?, ?)",
    chatId,
    content,
    role === Role.Bot ? "bot" : "user",
    imageUrl || "",
    prompt || "",
  );
};

export const deleteChat = async (db: SQLiteDatabase, chatId: number) => {
  return await db.runAsync("DELETE FROM chats WHERE id = ?", chatId);
};

export const renameChat = async (db: SQLiteDatabase, chatId: number, title: string) => {
  return await db.runAsync("UPDATE chats SET title = ? WHERE id = ?", title, chatId);
};
