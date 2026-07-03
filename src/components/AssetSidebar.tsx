import { Checkbox } from "./ui/checkbox";
import type { AssetState } from "../lib/types";

interface Props {
  assets: AssetState[];
  visible: Set<string>;
  onToggle: (id: string) => void;
}

export function AssetSidebar({ assets, visible, onToggle }: Props) {
  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 bg-neutral-50 p-3 overflow-y-auto">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">资产</h2>
        <span className="text-xs text-neutral-400">{assets.length}</span>
      </div>
      <ul className="space-y-1">
        {assets.map((a) => (
          <li
            key={a.asset.id}
            className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-100"
          >
            <label className="flex items-center gap-2 flex-1 cursor-pointer">
              <Checkbox
                checked={visible.has(a.asset.id)}
                onChange={() => onToggle(a.asset.id)}
              />
              <div className="flex flex-col">
                <span className="text-sm text-neutral-800">{a.asset.label}</span>
                <span className="text-[10px] text-neutral-400 uppercase">{a.asset.type}</span>
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
