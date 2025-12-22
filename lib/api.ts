import type { Asset, PriceData, AssetAnalysis } from './types';
import { calculateAllIndicators, generateTradingSignal } from './technical-analysis';

// Mock data generator for demonstration
// In production, replace with real API calls to Alpha Vantage, CoinGecko, etc.

async function generateMockPriceHistory(symbol: string, days: number = 100): Promise<PriceData[]> {
  const basePrice = 100 + Math.random() * 200;
  const history: PriceData[] = [];
  let currentPrice = basePrice;
  
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.48) * 0.05; // Slight upward bias
    currentPrice = currentPrice * (1 + change);
    const volume = 1000000 + Math.random() * 5000000;
    
    history.push({
      timestamp: now - (i * oneDay),
      price: Math.max(1, currentPrice),
      volume: Math.round(volume),
    });
  }
  
  return history;
}

export async function fetchStockPrice(symbol: string): Promise<Asset> {
  // In production, use Alpha Vantage API:
  // const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_API_KEY`);
  
  // Mock data for now
  const basePrice = 50 + Math.random() * 200;
  const change = (Math.random() - 0.5) * 10;
  
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol} Inc.`,
    type: 'stock',
    price: Math.round(basePrice * 100) / 100,
    change24h: Math.round(change * 100) / 100,
    changePercent24h: Math.round((change / basePrice) * 10000) / 100,
  };
}

export async function fetchCryptoPrice(symbol: string): Promise<Asset> {
  // In production, use CoinGecko API:
  // const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`);
  
  // Mock data for now
  const basePrice = 0.1 + Math.random() * 100;
  const change = (Math.random() - 0.5) * 5;
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
    type: 'crypto',
    price: Math.round(basePrice * 100) / 100,
    change24h: Math.round(change * 100) / 100,
    changePercent24h: Math.round((change / basePrice) * 10000) / 100,
  };
}

export async function analyzeAsset(asset: Asset): Promise<AssetAnalysis> {
  const priceHistory = await generateMockPriceHistory(asset.symbol);
  const indicators = calculateAllIndicators(priceHistory);
  const signal = generateTradingSignal(priceHistory, indicators);
  
  return {
    asset,
    signal,
    priceHistory,
    lastUpdated: new Date(),
  };
}

export async function searchStocks(query: string): Promise<Asset[]> {
  // Mock search - in production, use Alpha Vantage or similar
  const mockStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX'];
  return mockStocks
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(symbol => ({
      symbol,
      name: `${symbol} Inc.`,
      type: 'stock' as const,
      price: 0,
      change24h: 0,
      changePercent24h: 0,
    }));
}

export async function searchCrypto(query: string): Promise<Asset[]> {
  // Mock search - in production, use CoinGecko API
  const mockCrypto = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 'chainlink', 'avalanche', 'polygon'];
  return mockCrypto
    .filter(s => s.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(symbol => ({
      symbol: symbol.toUpperCase(),
      name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
      type: 'crypto' as const,
      price: 0,
      change24h: 0,
      changePercent24h: 0,
    }));
}

