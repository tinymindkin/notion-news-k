import type { AssetState, NewsEvent } from "./types";
import { formatBeijingReadable } from "./dates";

const CANDLE_UP = "#e04141";
const CANDLE_DOWN = "#2ecc71";
const EVENT_COLOR = "#f5a623";

interface BuildOptionInput {
  domain: string[];
  assets: AssetState[];
  events: NewsEvent[];
}

export function buildChartOption({ domain, assets, events }: BuildOptionInput) {
  const okAssets = assets.filter((a) => a.status === "ok" && a.candles.length > 0);
  const gridCount = okAssets.length + 1;

  const topPct = 4;
  const bottomPct = 8;
  const timelineHeightPct = 12;
  const gapPct = 2;
  const usableHeight = 100 - topPct - bottomPct - timelineHeightPct;
  const perGridHeight = okAssets.length > 0
    ? Math.max(6, (usableHeight - gapPct * okAssets.length) / okAssets.length)
    : 0;

  const grids: any[] = [];
  const xAxes: any[] = [];
  const yAxes: any[] = [];
  const series: any[] = [];

  const candleByDateByAsset = new Map<string, Map<string, number[]>>();
  for (const a of okAssets) {
    const m = new Map<string, number[]>();
    for (const c of a.candles) {
      m.set(c.dateKey, [c.open, c.close, c.low, c.high]);
    }
    candleByDateByAsset.set(a.asset.id, m);
  }

  okAssets.forEach((a, i) => {
    const top = topPct + i * (perGridHeight + gapPct);
    grids.push({
      left: 56,
      right: 24,
      top: `${top}%`,
      height: `${perGridHeight}%`,
      containLabel: false,
    });
    xAxes.push({
      type: "category",
      gridIndex: i,
      data: domain,
      boundaryGap: true,
      axisLine: { lineStyle: { color: "#bbb" } },
      axisLabel: { show: i === okAssets.length - 1 && events.length === 0, color: "#888" },
      splitLine: { show: false },
      axisTick: { show: false },
    });
    yAxes.push({
      type: "value",
      gridIndex: i,
      scale: true,
      splitLine: { lineStyle: { color: "#f0f0f0" } },
      axisLabel: { color: "#888", fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    });
    series.push({
      name: a.asset.label,
      type: "candlestick",
      xAxisIndex: i,
      yAxisIndex: i,
      data: domain.map((d) => candleByDateByAsset.get(a.asset.id)?.get(d) || [null, null, null, null]),
      itemStyle: {
        color: CANDLE_UP,
        color0: CANDLE_DOWN,
        borderColor: CANDLE_UP,
        borderColor0: CANDLE_DOWN,
      },
    });
  });

  const timelineGridIndex = okAssets.length;
  const timelineTop = topPct + okAssets.length * (perGridHeight + gapPct);
  grids.push({
    left: 56,
    right: 24,
    top: `${timelineTop}%`,
    height: `${timelineHeightPct}%`,
    containLabel: false,
  });
  xAxes.push({
    type: "category",
    gridIndex: timelineGridIndex,
    data: domain,
    boundaryGap: true,
    axisLine: { lineStyle: { color: "#bbb" } },
    axisLabel: { color: "#888", fontSize: 10 },
    splitLine: { show: false },
    axisTick: { show: true },
  });
  yAxes.push({
    type: "value",
    gridIndex: timelineGridIndex,
    show: false,
    min: 0,
    max: 10,
  });

  const eventsByDate = new Map<string, NewsEvent[]>();
  for (const e of events) {
    if (!eventsByDate.has(e.dateKey)) eventsByDate.set(e.dateKey, []);
    eventsByDate.get(e.dateKey)!.push(e);
  }

  const scatterData: any[] = [];
  for (const [dateKey, list] of eventsByDate) {
    list.forEach((ev, idx) => {
      const lane = 8 - (idx % 5) * 1.5;
      scatterData.push({
        value: [dateKey, lane],
        name: ev.title,
        eventData: ev,
      });
    });
  }

  series.push({
    name: "事件",
    type: "scatter",
    xAxisIndex: timelineGridIndex,
    yAxisIndex: timelineGridIndex,
    data: scatterData,
    symbol: "circle",
    symbolSize: 10,
    itemStyle: { color: EVENT_COLOR },
    label: {
      show: true,
      formatter: (p: any) => {
        const title = p.data?.name || "";
        return title.length > 12 ? title.slice(0, 12) + "…" : title;
      },
      position: "right",
      color: "#555",
      fontSize: 10,
    },
    emphasis: {
      focus: "self",
      itemStyle: { color: "#d97706" },
    },
  });

  const allXAxisIndex = xAxes.map((_, i) => i);

  return {
    animation: false,
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        link: [{ xAxisIndex: "all" }],
        label: { backgroundColor: "#666" },
      },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return "";
        const first = params[0];
        const dateKey = first.axisValueLabel || first.axisValue;
        const parts = [`<div style="font-weight:600;margin-bottom:4px">${dateKey}</div>`];
        for (const p of params) {
          if (p.seriesType === "candlestick" && Array.isArray(p.data) && p.data[1] != null) {
            const [, open, close, low, high] = p.data;
            parts.push(
              `<div>${p.seriesName}: O ${fmt(open)} C ${fmt(close)} L ${fmt(low)} H ${fmt(high)}</div>`,
            );
          } else if (p.seriesType === "scatter") {
            const ev: NewsEvent | undefined = p.data?.eventData;
            if (ev) {
              parts.push(
                `<div style="max-width:280px">📰 <b>${escapeHtml(ev.title)}</b>` +
                  (ev.brief ? `<div style="color:#666;margin-top:2px">${escapeHtml(ev.brief)}</div>` : "") +
                  `<div style="color:#999;margin-top:2px">${formatBeijingReadable(ev.time)}</div></div>`,
              );
            }
          }
        }
        return parts.join("");
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: "all" }],
      label: { backgroundColor: "#666" },
    },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: allXAxisIndex,
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        xAxisIndex: allXAxisIndex,
        bottom: 8,
        height: 20,
        start: 0,
        end: 100,
      },
    ],
    series,
  };
}

function fmt(v: number | null | undefined): string {
  if (v == null) return "-";
  return Number(v).toFixed(2);
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
