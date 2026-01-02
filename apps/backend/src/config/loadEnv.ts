import fs from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
const root = process.cwd();
const baseEnvPath = path.join(root, ".env");
const envPath = path.join(root, `.env.${appEnv}`);

if (fs.existsSync(baseEnvPath)) {
  loadEnv({ path: baseEnvPath, quiet: true });
}

if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath, override: true, quiet: true });
}

process.env.APP_ENV ??= appEnv;
