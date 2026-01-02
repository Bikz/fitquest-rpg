const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.assetExts = Array.from(new Set([...config.resolver.assetExts, "wasm"]));
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, "node_modules"),
  path.join(workspaceRoot, "node_modules"),
];

module.exports = config;
