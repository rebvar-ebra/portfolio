const assert = require("node:assert/strict");
const { mkdtemp, mkdir, writeFile } = require("node:fs/promises");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { createStudioServer } = require("./app.cjs");

async function withServer(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "rebvar-studio-"));
  await mkdir(path.join(root, "assets"));
  await writeFile(path.join(root, "index.html"), "<h1>Rebvar Studio</h1>");
  await writeFile(path.join(root, "assets", "studio.js"), "console.log('studio')");

  const server = createStudioServer(root);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("serves Sanity assets with their content type", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/assets/studio.js`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /javascript/);
    assert.equal(await response.text(), "console.log('studio')");
  });
});

test("falls back to index.html for Studio client-side routes", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/structure/portfolioProject`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.equal(await response.text(), "<h1>Rebvar Studio</h1>");
  });
});

test("does not expose files outside the Studio build", async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/..%2F..%2Fetc%2Fpasswd`);
    assert.equal(response.status, 400);
  });
});
