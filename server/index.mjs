import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

import { fetchNotionEvents, NotionApiError } from "./notion.mjs";
import { fetchFinnhubCandles } from "./finnhub.mjs";
import { isValidDateKey } from "./dates.mjs";
import { findAsset } from "../shared/assets.mjs";

loadDotenv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

const PORT = Number(process.env.PORT) || 8787;
// 容器通过 HOST=0.0.0.0 对外监听，本地默认只接受回环访问。
const HOST = process.env.HOST || "127.0.0.1";
const NOTION_KEY = process.env.NOTION_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

const REQUIRED_ENVS = { NOTION_KEY, NOTION_DATABASE_ID, NOTION_DATA_SOURCE_ID, FINNHUB_API_KEY };
const missing = Object.entries(REQUIRED_ENVS)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length > 0) {
  console.error(`[server] Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function parseDateRange(searchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from && !isValidDateKey(from)) {
    return { error: "invalid from date (YYYY-MM-DD)" };
  }
  if (to && !isValidDateKey(to)) {
    return { error: "invalid to date (YYYY-MM-DD)" };
  }
  return { from: from || null, to: to || null };
}

async function handleEvents(res, searchParams) {
  const range = parseDateRange(searchParams);
  if (range.error) {
    sendJson(res, 400, { error: range.error });
    return;
  }
  try {
    const { events, warnings } = await fetchNotionEvents({
      dataSourceId: NOTION_DATA_SOURCE_ID,
      databaseId: NOTION_DATABASE_ID,
      notionKey: NOTION_KEY,
      fromDate: range.from,
      toDate: range.to,
    });
    sendJson(res, 200, { events, warnings });
  } catch (err) {
    if (err instanceof NotionApiError) {
      const detail =
        err.status === 404 && err.code === "object_not_found"
          ? `${err.notionMessage} The IDs are valid, but the NOTION_KEY integration cannot access this database. Share the database with that integration or replace NOTION_KEY with a token that has access.`
          : err.notionMessage;
      console.error("[/api/events] error:", redactMessage(detail));
      sendJson(res, err.status === 429 ? 429 : 502, {
        error: "Notion request failed",
        code: err.code,
        detail: redactMessage(detail),
      });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    const status = /401|403|404/.test(msg) ? 502 : 500;
    console.error("[/api/events] error:", redactMessage(msg));
    sendJson(res, status, { error: "Notion request failed", detail: redactMessage(msg) });
  }
}

async function handleCandles(res, searchParams) {
  const assetId = searchParams.get("asset");
  if (!assetId) {
    sendJson(res, 400, { error: "missing asset" });
    return;
  }
  const asset = findAsset(assetId);
  if (!asset) {
    sendJson(res, 400, { error: `unknown asset: ${assetId}` });
    return;
  }
  const range = parseDateRange(searchParams);
  if (range.error) {
    sendJson(res, 400, { error: range.error });
    return;
  }
  if (!range.from || !range.to) {
    sendJson(res, 400, { error: "from and to are required" });
    return;
  }

  if ((!asset.symbol || !asset.endpoint) && !asset.yahooSymbol && !asset.fredSeries) {
    sendJson(res, 200, {
      asset: asset.id,
      symbol: null,
      candles: [],
      status: "no_data",
      message: "Finnhub symbol not configured or returned no_data",
    });
    return;
  }

  try {
    const result = await fetchFinnhubCandles(asset, range.from, range.to, FINNHUB_API_KEY);
    if (result.error) {
      if (/429/.test(result.error)) {
        sendJson(res, 429, { error: "rate limited", detail: result.error });
        return;
      }
      sendJson(res, 200, {
        asset: asset.id,
        symbol: asset.symbol,
        candles: [],
        status: "no_data",
        message: result.error,
      });
      return;
    }
    sendJson(res, 200, {
      asset: asset.id,
      symbol: asset.symbol,
      candles: result.candles,
      status: "ok",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/candles] error:", redactMessage(msg));
    sendJson(res, 500, { error: "Market data request failed", detail: redactMessage(msg) });
  }
}

function redactMessage(msg) {
  if (typeof msg !== "string") return String(msg);
  return msg
    .replaceAll(NOTION_KEY, "[redacted]")
    .replaceAll(FINNHUB_API_KEY, "[redacted]");
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safeJoin(base, target) {
  const resolved = path.resolve(base, "." + target);
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

function serveStatic(req, res) {
  if (!fs.existsSync(DIST_DIR)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found. Run `npm run build` first, or use Vite dev server.");
    return;
  }
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let filePath = safeJoin(DIST_DIR, urlPath === "/" ? "/index.html" : urlPath);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, "index.html");
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/api/events" && req.method === "GET") {
      await handleEvents(res, url.searchParams);
      return;
    }
    if (url.pathname === "/api/candles" && req.method === "GET") {
      await handleCandles(res, url.searchParams);
      return;
    }
    if (url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      sendJson(res, 404, { error: "not found" });
      return;
    }
    serveStatic(req, res);
  } catch (err) {
    console.error("[server] uncaught:", err);
    if (!res.headersSent) {
      sendJson(res, 500, { error: "internal error" });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[server] listening on http://${HOST}:${PORT}`);
});
