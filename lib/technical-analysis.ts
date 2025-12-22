import { RSI, MACD, SMA, BollingerBands } from 'technicalindicators';
import type { PriceData, TechnicalIndicators, TradingSignal } from './types';

export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  const rsiValues = RSI.calculate({
    values: prices,
    period: period,
  });
  
  return rsiValues[rsiValues.length - 1] || 50;
}

export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  const macdResult = MACD.calculate({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });
  
  const last = macdResult[macdResult.length - 1];
  return {
    macd: last?.MACD || 0,
    signal: last?.signal || 0,
    histogram: last?.histogram || 0,
  };
}

export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const smaValues = SMA.calculate({
    values: prices,
    period: period,
  });
  
  return smaValues[smaValues.length - 1] || prices[prices.length - 1] || 0;
}

export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} {
  if (prices.length < period) {
    const currentPrice = prices[prices.length - 1] || 0;
    return {
      upper: currentPrice * 1.02,
      middle: currentPrice,
      lower: currentPrice * 0.98,
    };
  }
  
  const bbResult = BollingerBands.calculate({
    values: prices,
    period: period,
    stdDev: stdDev,
  });
  
  const last = bbResult[bbResult.length - 1];
  return {
    upper: last?.upper || prices[prices.length - 1] || 0,
    middle: last?.middle || prices[prices.length - 1] || 0,
    lower: last?.lower || prices[prices.length - 1] || 0,
  };
}

export function calculateAllIndicators(priceHistory: PriceData[]): TechnicalIndicators {
  const prices = priceHistory.map(p => p.price);
  const volumes = priceHistory.map(p => p.volume || 0);
  
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const sma200 = calculateSMA(prices, 200);
  const bollingerBands = calculateBollingerBands(prices);
  const avgVolume = volumes.length > 0 
    ? volumes.reduce((a, b) => a + b, 0) / volumes.length 
    : 0;
  
  return {
    rsi,
    macd,
    sma20,
    sma50,
    sma200,
    bollingerBands,
    volume: avgVolume,
  };
}

export function generateTradingSignal(
  priceHistory: PriceData[],
  indicators: TechnicalIndicators
): TradingSignal {
  const currentPrice = priceHistory[priceHistory.length - 1]?.price || 0;
  const reasoning: string[] = [];
  let buyScore = 0;
  let sellScore = 0;
  
  // RSI Analysis
  if (indicators.rsi < 30) {
    buyScore += 25;
    reasoning.push('RSI indicates oversold condition (potential buy opportunity)');
  } else if (indicators.rsi > 70) {
    sellScore += 25;
    reasoning.push('RSI indicates overbought condition (potential sell opportunity)');
  } else if (indicators.rsi < 50) {
    buyScore += 10;
  } else {
    sellScore += 10;
  }
  
  // MACD Analysis
  if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
    buyScore += 20;
    reasoning.push('MACD shows bullish momentum');
  } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
    sellScore += 20;
    reasoning.push('MACD shows bearish momentum');
  }
  
  // Moving Average Analysis
  if (currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50) {
    buyScore += 15;
    reasoning.push('Price above key moving averages (bullish trend)');
  } else if (currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50) {
    sellScore += 15;
    reasoning.push('Price below key moving averages (bearish trend)');
  }
  
  if (currentPrice > indicators.sma200) {
    buyScore += 10;
    reasoning.push('Price above 200-day SMA (long-term bullish)');
  } else {
    sellScore += 10;
    reasoning.push('Price below 200-day SMA (long-term bearish)');
  }
  
  // Bollinger Bands Analysis
  if (currentPrice < indicators.bollingerBands.lower) {
    buyScore += 15;
    reasoning.push('Price near lower Bollinger Band (potential bounce)');
  } else if (currentPrice > indicators.bollingerBands.upper) {
    sellScore += 15;
    reasoning.push('Price near upper Bollinger Band (potential pullback)');
  }
  
  // Volume Analysis
  const recentVolume = priceHistory.slice(-5).reduce((sum, p) => sum + (p.volume || 0), 0) / 5;
  if (recentVolume > indicators.volume * 1.2) {
    if (buyScore > sellScore) {
      buyScore += 10;
      reasoning.push('High volume confirms bullish move');
    } else {
      sellScore += 10;
      reasoning.push('High volume confirms bearish move');
    }
  }
  
  // Determine signal
  const strength = Math.abs(buyScore - sellScore);
  let signal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  
  if (buyScore > sellScore + 15) {
    signal = 'BUY';
  } else if (sellScore > buyScore + 15) {
    signal = 'SELL';
  }
  
  // Calculate probabilities
  const totalScore = buyScore + sellScore || 1;
  const upProbability = Math.round((buyScore / totalScore) * 100);
  const downProbability = Math.round((sellScore / totalScore) * 100);
  
  // Calculate confidence based on strength and number of confirming indicators
  const confidence = Math.min(95, Math.max(50, strength + (reasoning.length * 5)));
  
  // Calculate price targets
  const priceTarget = {
    bullish: currentPrice * (1 + (strength / 100) * 0.1),
    bearish: currentPrice * (1 - (strength / 100) * 0.1),
  };
  
  if (reasoning.length === 0) {
    reasoning.push('Mixed signals - waiting for clearer trend');
  }
  
  return {
    signal,
    strength: Math.min(100, strength),
    probability: {
      up: upProbability,
      down: downProbability,
    },
    confidence: Math.round(confidence),
    reasoning,
    indicators,
    priceTarget,
  };
}

