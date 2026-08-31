export const ASSETS = [
  { id: "AAPL", label: "APPLE", type: "stock", symbol: "AAPL", endpoint: "/stock/candle", yahooSymbol: "AAPL" },
  { id: "NVDA", label: "navidia", type: "stock", symbol: "NVDA", endpoint: "/stock/candle", yahooSymbol: "NVDA" },
  { id: "ETH", label: "ETH", type: "crypto", symbol: "BINANCE:ETHUSDT", endpoint: "/crypto/candle", yahooSymbol: "ETH-USD" },
  { id: "BTC", label: "BTC", type: "crypto", symbol: "BINANCE:BTCUSDT", endpoint: "/crypto/candle", yahooSymbol: "BTC-USD" },
  { id: "USDCNY", label: "USD/RMB", type: "forex", symbol: "OANDA:USD_CNH", endpoint: "/forex/candle", yahooSymbol: "CNY=X" },
  { id: "GOLD", label: "黄金期货", type: "commodity", symbol: null, endpoint: null, yahooSymbol: "GC=F" },
  { id: "OIL", label: "WTI 原油期货", type: "commodity", symbol: null, endpoint: null, yahooSymbol: "CL=F" },
  { id: "USDJPY", label: "USD/JPY（日元）", type: "forex", symbol: null, endpoint: null, yahooSymbol: "JPY=X" },
  { id: "EURUSD", label: "EUR/USD（欧元）", type: "forex", symbol: null, endpoint: null, yahooSymbol: "EURUSD=X" },
  { id: "UST10Y", label: "美国10年国债收益率", type: "rate", symbol: null, endpoint: null, fredSeries: "DGS10" },
  { id: "FEDFUNDS", label: "联邦基金有效利率", type: "rate", symbol: null, endpoint: null, fredSeries: "DFF" },
];

export const DEFAULT_ASSET_IDS = ["AAPL", "NVDA", "ETH", "BTC", "USDCNY", "GOLD", "OIL", "USDJPY", "EURUSD", "UST10Y", "FEDFUNDS"];

export function findAsset(id) {
  return ASSETS.find((a) => a.id === id) || null;
}
