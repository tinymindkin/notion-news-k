import { useCallback, useEffect, useMemo, useState } from "react";
import { AssetSidebar } from "./components/AssetSidebar";
import { TopBar } from "./components/TopBar";
import { MarketEventChart } from "./components/MarketEventChart";
import { ASSETS, DEFAULT_ASSET_IDS } from "./lib/assets";
import { fetchCandles, fetchEvents } from "./lib/api";
import { subtractMonths, todayBeijingDateKey } from "./lib/dates";
import type { AssetState, NewsEvent } from "./lib/types";

export default function App() {
  const initialTo = useMemo(() => todayBeijingDateKey(), []);
  const initialFrom = useMemo(() => subtractMonths(initialTo, 6), [initialTo]);

  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);

  const [assets, setAssets] = useState<AssetState[]>(() =>
    ASSETS.map((a) => ({ asset: a, status: "loading" as const, candles: [] })),
  );
  const [events, setEvents] = useState<NewsEvent[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventsWarnings, setEventsWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [visible, setVisible] = useState<Set<string>>(() => new Set(DEFAULT_ASSET_IDS));

  const load = useCallback(
    async (rangeFrom: string, rangeTo: string) => {
      setLoading(true);
      setAssets((prev) => prev.map((a) => ({ ...a, status: "loading", candles: [] })));

      const eventsPromise = fetchEvents(rangeFrom, rangeTo)
        .then((data) => {
          setEvents(data.events);
          setEventsWarnings(data.warnings || []);
          setEventsError(null);
        })
        .catch((err: Error) => {
          setEvents([]);
          setEventsWarnings([]);
          setEventsError(err.message);
        });

      const candlesPromise = Promise.allSettled(
        ASSETS.map((a) => fetchCandles(a.id, rangeFrom, rangeTo)),
      ).then((results) => {
        setAssets(
          results.map((r, i) => {
            const asset = ASSETS[i];
            if (r.status === "rejected") {
              return {
                asset,
                status: "error",
                candles: [],
                message: r.reason instanceof Error ? r.reason.message : String(r.reason),
              };
            }
            const v = r.value;
            if (v.status === "no_data") {
              return { asset, status: "no_data", candles: [], message: v.message };
            }
            return { asset, status: "ok", candles: v.candles };
          }),
        );
      });

      await Promise.all([eventsPromise, candlesPromise]);
      setLoading(false);
    },
    [],
  );

  useEffect(() => {
    load(from, to);
  }, [from, to, load]);

  const onDateChange = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom);
    setTo(nextTo);
  };

  const onToggle = (id: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const okCount = assets.filter((a) => a.status === "ok").length;
  const allFailed = !loading && okCount === 0 && eventsError != null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-900 px-4 py-2 text-white">
        <span className="text-sm font-semibold">市场 K 线 × Notion 新闻事件</span>
        <span className="text-xs text-neutral-400">V1 · 1D</span>
      </div>
      <TopBar from={from} to={to} onChange={onDateChange} onRefresh={() => load(from, to)} loading={loading} />
      {(eventsError || eventsWarnings.length > 0) && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs text-amber-800">
          {eventsError && <div>事件加载失败：{eventsError}</div>}
          {eventsWarnings.length > 0 && (
            <div>Notion 警告 {eventsWarnings.length} 条（已跳过缺失字段的记录）</div>
          )}
        </div>
      )}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <AssetSidebar assets={assets} visible={visible} onToggle={onToggle} />
        {allFailed ? (
          <div className="flex-1 flex items-center justify-center text-sm text-neutral-500">
            <div className="text-center">
              <div className="mb-1 font-medium text-neutral-700">加载失败</div>
              <div className="text-xs">{eventsError}</div>
            </div>
          </div>
        ) : (
          <MarketEventChart
            from={from}
            to={to}
            assets={assets}
            events={events}
            visible={visible}
          />
        )}
      </div>
    </div>
  );
}
