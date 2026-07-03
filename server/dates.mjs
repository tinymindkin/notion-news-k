const BJ_OFFSET_MINUTES = 8 * 60;
const BJ_OFFSET_MS = BJ_OFFSET_MINUTES * 60 * 1000;

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateKey(v) {
  return typeof v === "string" && DATE_KEY_RE.test(v);
}

function utcMsForBeijingMidnight(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d, 0, 0, 0);
  return utcMs - BJ_OFFSET_MS;
}

export function beijingDayStartUnix(dateKey) {
  return Math.floor(utcMsForBeijingMidnight(dateKey) / 1000);
}

export function beijingDayEndUnix(dateKey) {
  return beijingDayStartUnix(dateKey) + 24 * 60 * 60 - 1;
}

export function beijingDateKeyFromDate(date) {
  const bj = new Date(date.getTime() + BJ_OFFSET_MS);
  const y = bj.getUTCFullYear();
  const m = String(bj.getUTCMonth() + 1).padStart(2, "0");
  const d = String(bj.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function beijingIsoFromDateOnly(dateKey) {
  return `${dateKey}T00:00:00+08:00`;
}

export function beijingIsoFromDate(date) {
  const bj = new Date(date.getTime() + BJ_OFFSET_MS);
  const y = bj.getUTCFullYear();
  const m = String(bj.getUTCMonth() + 1).padStart(2, "0");
  const d = String(bj.getUTCDate()).padStart(2, "0");
  const hh = String(bj.getUTCHours()).padStart(2, "0");
  const mm = String(bj.getUTCMinutes()).padStart(2, "0");
  const ss = String(bj.getUTCSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}+08:00`;
}

export function normalizeEventTime(raw) {
  if (!raw) return null;
  if (typeof raw !== "string") return null;
  if (isValidDateKey(raw)) {
    const dateKey = raw;
    return {
      dateKey,
      time: beijingIsoFromDateOnly(dateKey),
    };
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return {
    dateKey: beijingDateKeyFromDate(d),
    time: beijingIsoFromDate(d),
  };
}
