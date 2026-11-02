import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(webRoot, "..");
const standaloneRoot = resolve(webRoot, ".next/standalone");
const releaseRoot = resolve(repositoryRoot, ".release/rebvar-studio");

rmSync(releaseRoot, { recursive: true, force: true });
mkdirSync(releaseRoot, { recursive: true });
cpSync(standaloneRoot, releaseRoot, { recursive: true, verbatimSymlinks: true });
cpSync(resolve(webRoot, ".next/static"), resolve(releaseRoot, "web/.next/static"), { recursive: true });
cpSync(resolve(webRoot, "public"), resolve(releaseRoot, "web/public"), { recursive: true });

writeFileSync(
  resolve(releaseRoot, "app.js"),
  'import("./web/server.js").catch((error) => { console.error(error); process.exit(1); });\n',
);

console.log(releaseRoot);
