import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";
const root = resolve("dist");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(400);
      response.end();
      return;
    }
    try {
      if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    } catch {
      /* Serve the Pages fallback below. */
    }
    let body;
    try {
      body = await readFile(path);
    } catch {
      response.statusCode = 404;
      path = resolve(root, "404.html");
      body = await readFile(path);
    }
    response.setHeader(
      "Content-Type",
      types[extname(path)] || "application/octet-stream",
    );
    if (process.env.X1_PAGES_GZIP === "1" &&
        /\bgzip\b/.test(request.headers["accept-encoding"] ?? "") &&
        [".html", ".js", ".css", ".json", ".xml", ".svg"].includes(extname(path))) {
      response.setHeader("Content-Encoding", "gzip");
      response.setHeader("Vary", "Accept-Encoding");
      body = gzipSync(body);
    }
    response.end(body);
  } catch {
    response.writeHead(400);
    response.end("Invalid request");
  }
}).listen(4174, "0.0.0.0", () =>
  console.log("GitHub Pages fixture listening on port 4174"),
);
