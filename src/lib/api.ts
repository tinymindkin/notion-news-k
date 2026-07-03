import type { CandlesResponse, EventsResponse } from "./types";

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Bad JSON from ${url}: ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    const detail = body?.detail || body?.error || res.statusText;
    throw new Error(`${res.status} ${detail}`);
  }
  return body as T;
}

export function fetchEvents(from: string, to: string): Promise<EventsResponse> {
  const url = `/api/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  return jsonFetch<EventsResponse>(url);
}

export function fetchCandles(asset: string, from: string, to: string): Promise<CandlesResponse> {
  const url = `/api/candles?asset=${encodeURIComponent(asset)}&from=${encodeURIComponent(
    from,
  )}&to=${encodeURIComponent(to)}`;
  return jsonFetch<CandlesResponse>(url);
}
