import type { AssetConfig } from "./types";

export const ASSETS: AssetConfig[] = [
  { id: "AAPL", label: "APPLE", type: "stock", symbol: "AAPL", endpoint: "/stock/candle" },
  { id: "NVDA", label: "navidia", type: "stock", symbol: "NVDA", endpoint: "/stock/candle" },
  { id: "ETH", label: "ETH", type: "crypto", symbol: "BINANCE:ETHUSDT", endpoint: "/crypto/candle" },
  { id: "BTC", label: "BTC", type: "crypto", symbol: "BINANCE:BTCUSDT", endpoint: "/crypto/candle" },
  { id: "USDCNY", label: "USD/RMB", type: "forex", symbol: "OANDA:USD_CNH", endpoint: "/forex/candle" },
  { id: "GOLD", label: "黄金期货", type: "commodity", symbol: null, endpoint: null },
];

export const DEFAULT_ASSET_IDS = ["AAPL", "NVDA", "ETH", "BTC", "USDCNY", "GOLD"];
