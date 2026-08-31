import { beijingDayStartUnix, beijingDayEndUnix, beijingDateKeyFromDate, isValidDateKey } from "./dates.mjs";

export async function fetchFinnhubCandles(asset, fromDate, toDate, apiKey) {
  // FRED 利率序列不经过 Finnhub/Yahoo，直接复用统一 K 线响应结构。
  if (asset.fredSeries) {
    return fetchFredCandles(asset.fredSeries, fromDate, toDate);
  }

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

// 从 FRED 拉取官方日频利率，并转换成兼容现有图表的平盘 K 线。
async function fetchFredCandles(series, fromDate, toDate) {
  const url = new URL("https://fred.stlouisfed.org/graph/fredgraph.csv");
  url.searchParams.set("id", series);
  url.searchParams.set("cosd", fromDate);
  url.searchParams.set("coed", toDate);

  const res = await fetch(url.toString());
  // 上游失败时保留简短响应，方便资产状态展示而不泄漏整页内容。
  if (!res.ok) {
    return { error: `FRED API error ${res.status}: ${summarize(await res.text())}` };
  }

  const candles = parseFredCsv(await res.text());
  // 空区间和全缺失值统一返回 no_data。
  if (candles.length === 0) {
    return { error: `FRED returned no data for ${series}` };
  }
  return { candles };
}

// 解析 FRED 两列 CSV；缺失值以点号表示，直接跳过。
export function parseFredCsv(csv) {
  const candles = [];
  const rows = csv.trim().split(/\r?\n/).slice(1);
  // 每个有效观测映射为 O=H=L=C，避免伪造不存在的日内波动。
  for (const row of rows) {
    const [dateKey, rawValue] = row.split(",");
    const value = Number(rawValue);
    // 只接受合法日期和有限数值，忽略周末空值或异常行。
    if (!isValidDateKey(dateKey) || rawValue === "" || !Number.isFinite(value)) {
      continue;
    }
    candles.push({
      dateKey,
      time: beijingDayStartUnix(dateKey),
      open: value,
      high: value,
      low: value,
      close: value,
      volume: 0,
    });
  }
  return candles;
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
