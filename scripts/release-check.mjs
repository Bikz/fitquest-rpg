import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..", "..");
const mobileEnvPath = path.join(repoRoot, "apps", "mobile", ".env");
const backendEnvPath = path.join(repoRoot, "apps", "backend", ".env");

const parseEnv = (content) => {
  const env = {};
  const lines = content.split("\n").map((line) => line.trim());
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    env[key] = value;
  }
  return env;
};

const loadEnv = (filePath) => {
  if (!existsSync(filePath)) {
    return null;
  }
  return parseEnv(readFileSync(filePath, "utf8"));
};

const warnMissing = (label, missing) => {
  if (missing.length === 0) return;
  console.warn(`\n[${label}] Missing values:`);
  for (const key of missing) {
    console.warn(`- ${key}`);
  }
};

const mobileEnv = loadEnv(mobileEnvPath);
const backendEnv = loadEnv(backendEnvPath);

if (!mobileEnv) {
  console.error("apps/mobile/.env is missing.");
  process.exit(1);
}

if (!backendEnv) {
  console.error("apps/backend/.env is missing.");
  process.exit(1);
}

const mobileRequired = ["EXPO_PUBLIC_API_BASE_URL", "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"];
const mobileMissing = mobileRequired.filter((key) => !mobileEnv[key]);
warnMissing("mobile", mobileMissing);

const backendRequired = ["DATABASE_URL"];
const backendMissing = backendRequired.filter((key) => !backendEnv[key]);
warnMissing("backend", backendMissing);

if (backendEnv.AUTH_MODE === "jwt") {
  const jwtKeys = ["AUTH_JWKS_URL", "AUTH_ISSUER", "AUTH_AUDIENCE"];
  warnMissing(
    "backend-jwt",
    jwtKeys.filter((key) => !backendEnv[key]),
  );
}

if (backendEnv.STORAGE_MODE === "s3") {
  const storageKeys = [
    "STORAGE_ENDPOINT",
    "STORAGE_BUCKET",
    "STORAGE_ACCESS_KEY",
    "STORAGE_SECRET_KEY",
    "STORAGE_PUBLIC_BASE_URL",
  ];
  warnMissing(
    "backend-storage",
    storageKeys.filter((key) => !backendEnv[key]),
  );
}

if (backendEnv.ENTITLEMENTS_SYNC_MODE === "server") {
  const billingKeys = ["BILLING_WEBHOOK_SECRET"];
  warnMissing(
    "backend-billing",
    billingKeys.filter((key) => !backendEnv[key]),
  );
}

console.log("\nRunning backend migrations...");
spawnSync("bun", ["run", "backend:migrate"], {
  cwd: repoRoot,
  stdio: "inherit",
});

const baseUrl = mobileEnv.EXPO_PUBLIC_API_BASE_URL || `http://localhost:${backendEnv.PORT || 8787}`;

const checkEndpoint = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Warning: ${url} returned ${response.status}`);
      return;
    }
    console.log(`OK: ${url}`);
  } catch {
    console.warn(`Warning: unable to reach ${url}`);
  }
};

console.log("\nHealth checks...");
await checkEndpoint(`${baseUrl}/health`);
await checkEndpoint(`${baseUrl}/app/version`);

console.log("\nRelease checklist finished.");
