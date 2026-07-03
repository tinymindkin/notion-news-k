import { normalizeEventTime } from "./dates.mjs";

const NOTION_VERSION = "2026-03-11";

export class NotionApiError extends Error {
  constructor(status, body) {
    const message = body?.message || "Notion request failed";
    super(`Notion API error ${status}: ${message}`);
    this.name = "NotionApiError";
    this.status = status;
    this.code = body?.code || null;
    this.notionMessage = message;
  }
}

export async function fetchNotionEvents({ dataSourceId, databaseId, notionKey, fromDate, toDate }) {
  const url = `https://api.notion.com/v1/data_sources/${dataSourceId}/query`;
  const headers = {
    Authorization: `Bearer ${notionKey}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };

  const body = {
    sorts: [{ property: "事件时间", direction: "ascending" }],
  };

  if (fromDate || toDate) {
    body.filter = { property: "事件时间", date: {} };
    if (fromDate) body.filter.date.on_or_after = fromDate;
    if (toDate) body.filter.date.on_or_before = toDate;
  }

  const events = [];
  const warnings = [];
  let hasMore = true;
  let startCursor = undefined;

  try {
    while (hasMore) {
      if (startCursor) body.start_cursor = startCursor;
      const data = await fetchNotionJson(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      for (const row of data.results || []) {
        const event = parseNotionRow(row);
        if (event.error) {
          warnings.push(event.error);
        } else {
          events.push(event);
        }
      }
      hasMore = data.has_more || false;
      startCursor = data.next_cursor;
    }
  } catch (err) {
    if (err instanceof NotionApiError && err.status === 404 && databaseId) {
      const resolvedId = await resolveDataSourceId(databaseId, notionKey);
      if (resolvedId && resolvedId !== dataSourceId) {
        return fetchNotionEvents({ dataSourceId: resolvedId, databaseId, notionKey, fromDate, toDate });
      }
    }
    throw err;
  }

  return { events, warnings };
}

async function resolveDataSourceId(databaseId, notionKey) {
  const data = await fetchNotionJson(`https://api.notion.com/v1/databases/${databaseId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${notionKey}`,
      "Notion-Version": NOTION_VERSION,
    },
  });
  return data.data_sources?.[0]?.id || null;
}

async function fetchNotionJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new NotionApiError(res.status, body);
  }
  return body;
}

function parseNotionRow(row) {
  const props = row.properties || {};
  const id = row.id;

  const nameField = props["Name"] || props["name"] || props["标题"];
  const title = extractPlainText(nameField);

  const briefField = props["brief"] || props["Brief"] || props["摘要"];
  const brief = extractPlainText(briefField);

  const urlField = props["URL"] || props["url"];
  const url = urlField?.url || null;

  const eventTimeField = props["事件时间"];
  const eventTimeRaw = eventTimeField?.date?.start || null;
  const normalized = normalizeEventTime(eventTimeRaw);
  if (!normalized) {
    return { error: `page ${id} skipped: missing or invalid 事件时间` };
  }

  const createdTimeField = props["Created time"] || props["created_time"];
  const createdTime = createdTimeField?.created_time || null;

  return {
    id,
    title: title || "(无标题)",
    brief: brief || "",
    url,
    time: normalized.time,
    dateKey: normalized.dateKey,
    createdTime,
    source: "notion",
  };
}

function extractPlainText(field) {
  if (!field) return "";
  if (field.type === "title" && Array.isArray(field.title)) {
    return field.title.map((t) => t.plain_text || "").join("");
  }
  if (field.type === "rich_text" && Array.isArray(field.rich_text)) {
    return field.rich_text.map((t) => t.plain_text || "").join("");
  }
  return "";
}
