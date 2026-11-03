const { createReadStream, existsSync, statSync } = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(request, response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  response.statusCode = 200;
  response.setHeader("Content-Type", contentTypes[extension] ?? "application/octet-stream");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");

  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else {
    response.setHeader("Cache-Control", "no-cache");
  }

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).pipe(response);
}

function createStudioServer(publicRoot = path.join(__dirname, "public")) {
  const resolvedRoot = path.resolve(publicRoot);

  return http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      response.writeHead(400).end("Bad request");
      return;
    }

    if (pathname.split("/").includes("..")) {
      response.writeHead(400).end("Bad request");
      return;
    }

    const relativePath = pathname.replace(/^\/+/, "");
    const requestedPath = path.resolve(resolvedRoot, relativePath || "index.html");

    if (!requestedPath.startsWith(`${resolvedRoot}${path.sep}`) && requestedPath !== resolvedRoot) {
      response.writeHead(400).end("Bad request");
      return;
    }

    if (existsSync(requestedPath) && statSync(requestedPath).isFile()) {
      sendFile(request, response, requestedPath);
      return;
    }

    if (path.extname(relativePath)) {
      response.writeHead(404).end("Not found");
      return;
    }

    sendFile(request, response, path.join(resolvedRoot, "index.html"));
  });
}

if (require.main === module) {
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  createStudioServer().listen(port, "0.0.0.0", () => {
    console.log(`Rebvar Studio listening on port ${port}`);
  });
}

module.exports = { createStudioServer };
