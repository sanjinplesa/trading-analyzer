export type AssetType = 'stock' | 'crypto';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  change24h: number;
  changePercent24h: number;
}

export interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: number;
}

export interface TradingSignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: number; // 0-100
  probability: {
    up: number; // 0-100
    down: number; // 0-100
  };
  confidence: number; // 0-100
  reasoning: string[];
  indicators: TechnicalIndicators;
  priceTarget?: {
    bullish: number;
    bearish: number;
  };
}

export interface AssetAnalysis {
  asset: Asset;
  signal: TradingSignal;
  priceHistory: PriceData[];
  lastUpdated: Date;
}

