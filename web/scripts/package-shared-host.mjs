import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(webRoot, "..");
const standaloneRoot = resolve(webRoot, ".next/standalone");
const releaseRoot = resolve(repositoryRoot, ".release/rebvar-studio");
const archivePath = resolve(repositoryRoot, ".release/rebvar-studio-release.tar.gz");

rmSync(releaseRoot, { recursive: true, force: true });
rmSync(archivePath, { force: true });
mkdirSync(releaseRoot, { recursive: true });
cpSync(standaloneRoot, releaseRoot, { recursive: true, verbatimSymlinks: true });
const swcHelpersDestination = resolve(releaseRoot, "node_modules/@swc/helpers");
mkdirSync(dirname(swcHelpersDestination), { recursive: true });
cpSync(resolve(webRoot, "node_modules/@swc/helpers"), swcHelpersDestination, {
  recursive: true,
  dereference: true,
});
cpSync(resolve(webRoot, ".next/static"), resolve(releaseRoot, "web/.next/static"), { recursive: true });
cpSync(resolve(webRoot, "public"), resolve(releaseRoot, "web/public"), { recursive: true });

writeFileSync(
  resolve(releaseRoot, "app.js"),
  'import("./web/server.js").catch((error) => { console.error(error); process.exit(1); });\n',
);

const archive = spawnSync("tar", ["-czf", archivePath, "-C", releaseRoot, "."], { stdio: "inherit" });
if (archive.error) throw archive.error;
if (archive.status !== 0) throw new Error(`tar exited with status ${archive.status ?? "unknown"}`);

console.log(archivePath);
