import "../src/config/loadEnv";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "../src/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, "..", "migrations");

const ensureMigrationsTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
};

const getAppliedMigrations = async () => {
  const rows = await sql<{ name: string }[]>`
    SELECT name FROM schema_migrations ORDER BY name;
  `;
  return new Set(rows.map((row) => row.name));
};

const runMigration = async (name: string, contents: string) => {
  await sql.begin(async (tx) => {
    await tx.unsafe(contents);
    await tx`INSERT INTO schema_migrations (name) VALUES (${name});`;
  });
};

const migrate = async () => {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const contents = await readFile(path.join(migrationsDir, file), "utf8");
    console.log(`Running migration ${file}...`);
    await runMigration(file, contents);
  }

  console.log("Migrations complete.");
  await sql.end({ timeout: 5 });
};

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exitCode = 1;
});
