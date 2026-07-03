import { useMemo, useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import type * as echarts from "echarts";
import { buildChartOption } from "../lib/chart";
import type { AssetState, NewsEvent } from "../lib/types";
import { domainBetween } from "../lib/dates";

interface Props {
  from: string;
  to: string;
  assets: AssetState[];
  events: NewsEvent[];
  visible: Set<string>;
}

export function MarketEventChart({ from, to, assets, events, visible }: Props) {
  const ref = useRef<ReactECharts | null>(null);

  const domain = useMemo(() => domainBetween(from, to), [from, to]);
  const visibleAssets = useMemo(
    () => assets.filter((a) => visible.has(a.asset.id)),
    [assets, visible],
  );

  const option = useMemo(
    () => buildChartOption({ domain, assets: visibleAssets, events }),
    [domain, visibleAssets, events],
  );
  const okAssetCount = visibleAssets.filter((a) => a.status === "ok").length;
  const chartHeight = Math.max(520, okAssetCount * 200 + 220);

  useEffect(() => {
    const inst = ref.current?.getEchartsInstance() as echarts.ECharts | undefined;
    if (!inst) return;
    const zr = inst.getZr();

    const onClick = (params: any) => {
      const ev: NewsEvent | undefined = params?.data?.eventData;
      if (ev?.url) {
        window.open(ev.url, "_blank", "noopener,noreferrer");
      }
    };
    inst.on("click", onClick);

    const onMouseOut = () => {
      inst.dispatchAction({ type: "hideTip" });
      inst.dispatchAction({ type: "updateAxisPointer", currTrigger: "leave" });
    };
    zr.on("globalout", onMouseOut);

    return () => {
      inst.off("click", onClick);
      zr.off("globalout", onMouseOut);
    };
  }, [option]);

  if (okAssetCount === 0 && events.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-neutral-400 text-sm">
        暂无可显示的行情或事件
      </div>
    );
  }

  return (
    <div className="chart-scrollbar flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-white pb-4">
      <ReactECharts
        ref={(r) => {
          ref.current = r;
        }}
        option={option}
        style={{ height: chartHeight, width: "100%" }}
        notMerge={true}
        lazyUpdate={false}
      />
    </div>
  );
}
