import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Button } from "./ui/button";

interface Props {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function TopBar({ from, to, onChange, onRefresh, loading }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">从</span>
        <Input
          type="date"
          value={from}
          onChange={(e) => onChange(e.target.value, to)}
          className="w-40"
        />
        <span className="text-xs text-neutral-500">至</span>
        <Input
          type="date"
          value={to}
          onChange={(e) => onChange(from, e.target.value)}
          className="w-40"
        />
      </div>
      <Select value="1D" disabled className="w-20">
        <option value="1D">1D</option>
      </Select>
      <Button size="sm" onClick={onRefresh} disabled={loading}>
        {loading ? "加载中…" : "刷新"}
      </Button>
      <div className="flex-1" />
      <Button size="sm" variant="outline" disabled>
        设置
      </Button>
      <Button size="sm" variant="outline" disabled>
        导出
      </Button>
    </div>
  );
}
