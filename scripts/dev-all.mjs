import { spawn } from "node:child_process";

const commands = [
  { name: "backend", cmd: "bun", args: ["run", "backend:dev"] },
  { name: "mobile", cmd: "bun", args: ["run", "mobile:start"] },
];

const children = commands.map(({ cmd, args }) =>
  spawn(cmd, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  }),
);

const shutdown = () => {
  for (const child of children) {
    child.kill("SIGINT");
  }
};

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});
