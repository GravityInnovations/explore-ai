import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json"],
]);
const server = http.createServer(async (request, response) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = requestPath === "/" || requestPath === "/runtime-probe.html"
      ? "tests/e2e/runtime-probe.html"
      : ["/catalog", "/grade-2", "/grade-7"].some((prefix) => requestPath === prefix) || requestPath.startsWith("/lesson/")
        ? "tests/e2e/fixture/index.html"
        : requestPath.slice(1);
    const file = path.resolve(root, relative);
    if (!(file === root || file.startsWith(`${root}${path.sep}`))) throw new Error("Path escapes fixture root");
    const body = await readFile(file);
    response.writeHead(200, { "content-type": mime.get(path.extname(file)) ?? "application/octet-stream" });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 400);
    response.end(error.message);
  }
});
const port = Number(process.env.PORT ?? 4177);
server.listen(port, "127.0.0.1");
process.once("SIGTERM", () => server.close(() => process.exit(0)));
