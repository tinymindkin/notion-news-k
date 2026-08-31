export type AssetType = "stock" | "crypto" | "forex" | "commodity" | "rate";

export interface AssetConfig {
  id: string;
  label: string;
  type: AssetType;
  symbol: string | null;
  endpoint: string | null;
}

export interface Candle {
  dateKey: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandleStatus = "ok" | "no_data";

export interface CandlesResponse {
  asset: string;
  symbol: string | null;
  candles: Candle[];
  status: CandleStatus;
  message?: string;
}

export interface NewsEvent {
  id: string;
  title: string;
  brief: string;
  url: string | null;
  time: string;
  dateKey: string;
  createdTime: string | null;
  source: "notion";
}

export interface EventsResponse {
  events: NewsEvent[];
  warnings: string[];
}

export interface AssetState {
  asset: AssetConfig;
  status: "loading" | "ok" | "no_data" | "error";
  candles: Candle[];
  message?: string;
}
