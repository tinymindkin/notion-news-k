export const ASSETS = [
  { id: "AAPL", label: "APPLE", type: "stock", symbol: "AAPL", endpoint: "/stock/candle", yahooSymbol: "AAPL" },
  { id: "NVDA", label: "navidia", type: "stock", symbol: "NVDA", endpoint: "/stock/candle", yahooSymbol: "NVDA" },
  { id: "ETH", label: "ETH", type: "crypto", symbol: "BINANCE:ETHUSDT", endpoint: "/crypto/candle", yahooSymbol: "ETH-USD" },
  { id: "BTC", label: "BTC", type: "crypto", symbol: "BINANCE:BTCUSDT", endpoint: "/crypto/candle", yahooSymbol: "BTC-USD" },
  { id: "USDCNY", label: "USD/RMB", type: "forex", symbol: "OANDA:USD_CNH", endpoint: "/forex/candle", yahooSymbol: "CNY=X" },
  { id: "GOLD", label: "黄金期货", type: "commodity", symbol: null, endpoint: null, yahooSymbol: "GC=F" },
];

export const DEFAULT_ASSET_IDS = ["AAPL", "NVDA", "ETH", "BTC", "USDCNY", "GOLD"];

export function findAsset(id) {
  return ASSETS.find((a) => a.id === id) || null;
}
