import type { AssetConfig } from "./types";

export const ASSETS: AssetConfig[] = [
  { id: "AAPL", label: "APPLE", type: "stock", symbol: "AAPL", endpoint: "/stock/candle" },
  { id: "NVDA", label: "navidia", type: "stock", symbol: "NVDA", endpoint: "/stock/candle" },
  { id: "ETH", label: "ETH", type: "crypto", symbol: "BINANCE:ETHUSDT", endpoint: "/crypto/candle" },
  { id: "BTC", label: "BTC", type: "crypto", symbol: "BINANCE:BTCUSDT", endpoint: "/crypto/candle" },
  { id: "USDCNY", label: "USD/RMB", type: "forex", symbol: "OANDA:USD_CNH", endpoint: "/forex/candle" },
  { id: "GOLD", label: "黄金期货", type: "commodity", symbol: null, endpoint: null },
  { id: "OIL", label: "WTI 原油期货", type: "commodity", symbol: null, endpoint: null },
  { id: "USDJPY", label: "USD/JPY（日元）", type: "forex", symbol: null, endpoint: null },
  { id: "EURUSD", label: "EUR/USD（欧元）", type: "forex", symbol: null, endpoint: null },
  { id: "UST10Y", label: "美国10年国债收益率", type: "rate", symbol: null, endpoint: null },
  { id: "FEDFUNDS", label: "联邦基金有效利率", type: "rate", symbol: null, endpoint: null },
];

export const DEFAULT_ASSET_IDS = ["AAPL", "NVDA", "ETH", "BTC", "USDCNY", "GOLD", "OIL", "USDJPY", "EURUSD", "UST10Y", "FEDFUNDS"];
