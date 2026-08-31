import assert from "node:assert/strict";

import { parseFredCsv } from "./finnhub.mjs";

// 验证有效利率被保留、FRED 点号缺失值被忽略。
const candles = parseFredCsv("observation_date,DGS10\n2026-08-20,4.69\n2026-08-21,.\n");
assert.equal(candles.length, 1);
assert.equal(candles[0].dateKey, "2026-08-20");
assert.equal(candles[0].close, 4.69);
