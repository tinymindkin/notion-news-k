import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import type { AssetState, NewsEvent } from "../lib/types";

interface Props {
  assets: AssetState[];
  visible: Set<string>;
  onToggle: (id: string) => void;
  events: NewsEvent[];
  newsQuery: string;
  onNewsQueryChange: (value: string) => void;
}

// 左侧栏：上半区展示资产，下半区展示可即时搜索的新闻。
export function AssetSidebar({
  assets,
  visible,
  onToggle,
  events,
  newsQuery,
  onNewsQueryChange,
}: Props) {
  return (
    <aside className="flex min-h-0 w-56 shrink-0 flex-col overflow-hidden border-r border-neutral-200 bg-neutral-50">
      {/* 资产区域：标题固定，资产列表在有限高度内独立滚动。 */}
      <section className="flex min-h-0 basis-1/2 flex-col border-b border-neutral-200 p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">资产</h2>
          <span className="text-xs text-neutral-400">{assets.length}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <ul className="space-y-1">
            {assets.map((a) => (
              <li
                key={a.asset.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-100"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={visible.has(a.asset.id)}
                    onChange={() => onToggle(a.asset.id)}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-neutral-800">{a.asset.label}</span>
                    <span className="text-[10px] uppercase text-neutral-400">{a.asset.type}</span>
                  </div>
                </label>
                <StatusBadge status={a.status} message={a.message} />
              </li>
            ))}
          </ul>
          <button
            disabled
            className="mt-3 w-full rounded-md border border-dashed border-neutral-300 py-1.5 text-xs text-neutral-400"
          >
            + 添加资产
          </button>
        </div>
      </section>

      {/* 新闻区域：搜索框固定，匹配结果列表在下半区独立滚动。 */}
      <section className="flex min-h-0 basis-1/2 flex-col p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-700">新闻</h2>
          <span className="text-xs text-neutral-400">{events.length}</span>
        </div>
        <Input
          type="search"
          value={newsQuery}
          onChange={(event) => onNewsQueryChange(event.target.value)}
          placeholder="搜索标题或摘要"
          aria-label="搜索新闻"
          className="mb-2 h-8 w-full text-xs"
        />
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {/* 新闻列表：搜索无结果时给出明确提示。 */}
          {events.length > 0 ? (
            <ul className="space-y-1.5">
              {events.map((event) => (
                <li key={event.id} className="rounded-md bg-white px-2 py-1.5 shadow-sm">
                  <time
                    className="text-[10px] text-neutral-400"
                    dateTime={event.createdTime ?? undefined}
                  >
                    {event.dateKey}
                  </time>
                  <div className="break-words text-xs leading-4 text-neutral-700">
                    {event.title}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-2 py-4 text-center text-xs text-neutral-400">没有匹配的新闻</div>
          )}
        </div>
      </section>
    </aside>
  );
}

function StatusBadge({ status, message }: { status: AssetState["status"]; message?: string }) {
  const map: Record<AssetState["status"], { color: string; label: string }> = {
    loading: { color: "bg-neutral-200 text-neutral-500", label: "…" },
    ok: { color: "bg-emerald-100 text-emerald-600", label: "OK" },
    no_data: { color: "bg-amber-100 text-amber-600", label: "无" },
    error: { color: "bg-rose-100 text-rose-600", label: "错" },
  };
  const s = map[status];
  return (
    <span
      className={`ml-2 rounded px-1.5 py-0.5 text-[10px] ${s.color}`}
      title={message}
    >
      {s.label}
    </span>
  );
}
