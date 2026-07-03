import { beijingDayStartUnix, beijingDayEndUnix, beijingDateKeyFromDate } from "./dates.mjs";

export async function fetchFinnhubCandles(asset, fromDate, toDate, apiKey) {
  let finnhubError = null;

  if (asset.symbol && asset.endpoint) {
    const from = beijingDayStartUnix(fromDate);
    const to = beijingDayEndUnix(toDate);

    const url = new URL(`https://finnhub.io/api/v1${asset.endpoint}`);
    url.searchParams.set("symbol", asset.symbol);
    url.searchParams.set("resolution", "D");
    url.searchParams.set("from", String(from));
    url.searchParams.set("to", String(to));
    url.searchParams.set("token", apiKey);

    const res = await fetch(url.toString());
    if (res.ok) {
      const data = await res.json();
      if (data.s === "ok") {
        return { candles: parseFinnhubCandles(data) };
      }
      finnhubError = `Finnhub returned status: ${data.s}`;
    } else {
      finnhubError = `Finnhub API error ${res.status}: ${summarize(await res.text())}`;
    }
  }

  if (asset.yahooSymbol) {
    const fallback = await fetchYahooCandles(asset.yahooSymbol, fromDate, toDate);
    if (!fallback.error) return fallback;
    return { error: `${finnhubError || `Asset ${asset.id} not supported by Finnhub`}; Yahoo fallback failed: ${fallback.error}` };
  }

  return { error: finnhubError || `Asset ${asset.id} not supported by Finnhub` };
}

function parseFinnhubCandles(data) {
  const candles = [];
  const count = data.t?.length || 0;
  for (let i = 0; i < count; i++) {
    const t = data.t[i];
    candles.push({
      dateKey: beijingDateKeyFromDate(new Date(t * 1000)),
      time: t,
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    });
  }
  return candles;
}

async function fetchYahooCandles(symbol, fromDate, toDate) {
  const from = beijingDayStartUnix(fromDate);
  const to = beijingDayEndUnix(toDate);

  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  url.searchParams.set("period1", String(from));
  url.searchParams.set("period2", String(to));
  url.searchParams.set("interval", "1d");

  const res = await fetch(url.toString());
  if (!res.ok) {
    return { error: `Yahoo API error ${res.status}: ${summarize(await res.text())}` };
  }

  const data = await res.json();
  const result = data.chart?.result?.[0];
  const yahooError = data.chart?.error?.description;
  if (!result) {
    return { error: yahooError || "Yahoo returned no result" };
  }

  const quote = result.indicators?.quote?.[0] || {};
  const candles = [];
  const count = result.timestamp?.length || 0;
  for (let i = 0; i < count; i++) {
    const t = result.timestamp[i];
    const open = quote.open?.[i];
    const high = quote.high?.[i];
    const low = quote.low?.[i];
    const close = quote.close?.[i];
    if (![open, high, low, close].every(Number.isFinite)) continue;
    candles.push({
      dateKey: beijingDateKeyFromDate(new Date(t * 1000)),
      time: t,
      open,
      high,
      low,
      close,
      volume: quote.volume?.[i] || 0,
    });
  }

  return candles.length > 0 ? { candles } : { error: "Yahoo returned no candles" };
}

function summarize(text) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}
