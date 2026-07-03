const BJ_OFFSET_MS = 8 * 60 * 60 * 1000;

export function todayBeijingDateKey(): string {
  return beijingDateKey(new Date());
}

export function beijingDateKey(date: Date): string {
  const bj = new Date(date.getTime() + BJ_OFFSET_MS);
  const y = bj.getUTCFullYear();
  const m = String(bj.getUTCMonth() + 1).padStart(2, "0");
  const d = String(bj.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function subtractMonths(dateKey: string, months: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 - months, d));
  const yy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(target.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function domainBetween(from: string, to: string): string[] {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const start = Date.UTC(fy, fm - 1, fd);
  const end = Date.UTC(ty, tm - 1, td);
  const out: string[] = [];
  for (let t = start; t <= end; t += 24 * 60 * 60 * 1000) {
    const d = new Date(t);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    out.push(`${y}-${m}-${dd}`);
  }
  return out;
}

export function formatBeijingReadable(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const bj = new Date(d.getTime() + BJ_OFFSET_MS);
  const y = bj.getUTCFullYear();
  const m = String(bj.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(bj.getUTCDate()).padStart(2, "0");
  const hh = String(bj.getUTCHours()).padStart(2, "0");
  const mi = String(bj.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${dd} ${hh}:${mi}`;
}
