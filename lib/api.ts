import type { Asset, PriceData, AssetAnalysis } from './types';
import { calculateAllIndicators, generateTradingSignal } from './technical-analysis';

// Mock data generator for demonstration
// In production, replace with real API calls to Alpha Vantage, CoinGecko, etc.

// Seeded random number generator for consistent mock data
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Generate consistent price based on symbol
function getSymbolSeed(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = ((hash << 5) - hash) + symbol.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate daily seed that changes once per day
function getDailySeed(): number {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function generateMockPriceHistory(symbol: string, days: number = 100): Promise<PriceData[]> {
  const seed = getSymbolSeed(symbol);
  const random = seededRandom(seed);
  
  // Consistent base price for each symbol
  const basePrice = 100 + (random() * 200);
  const history: PriceData[] = [];
  let currentPrice = basePrice;
  
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (let i = days; i >= 0; i--) {
    const change = (random() - 0.48) * 0.05; // Slight upward bias
    currentPrice = currentPrice * (1 + change);
    const volume = 1000000 + random() * 5000000;
    
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
  
  // Mock data with consistent prices based on symbol
  const seed = getSymbolSeed(symbol.toUpperCase());
  const random = seededRandom(seed);
  
  // Realistic stock prices for common symbols
  const stockPrices: Record<string, number> = {
    'AAPL': 175.50,
    'GOOGL': 142.30,
    'MSFT': 378.85,
    'AMZN': 151.20,
    'TSLA': 248.50,
    'META': 485.20,
    'NVDA': 875.60,
    'NFLX': 485.30,
  };
  
  const basePrice = stockPrices[symbol.toUpperCase()] || (50 + (random() * 200));
  
  // Use daily seed for consistent daily changes
  const dailySeed = getDailySeed();
  const dailyRandom = seededRandom(seed + dailySeed);
  const changePercent = (dailyRandom() - 0.5) * 4; // -2% to +2% change
  const change = basePrice * (changePercent / 100);
  
  return {
    symbol: symbol.toUpperCase(),
    name: `${symbol} Inc.`,
    type: 'stock',
    price: Math.round(basePrice * 100) / 100,
    change24h: Math.round(change * 100) / 100,
    changePercent24h: Math.round(changePercent * 100) / 100,
  };
}

export async function fetchCryptoPrice(symbol: string): Promise<Asset> {
  // In production, use CoinGecko API:
  // const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`);
  
  // Mock data with consistent prices based on symbol
  const seed = getSymbolSeed(symbol.toLowerCase());
  const random = seededRandom(seed);
  
  // Realistic crypto prices for common coins
  const cryptoPrices: Record<string, number> = {
    'BITCOIN': 43250.00,
    'ETHEREUM': 2650.50,
    'SOLANA': 98.75,
    'CARDANO': 0.52,
    'POLKADOT': 7.25,
    'CHAINLINK': 14.80,
    'AVALANCHE': 36.40,
    'POLYGON': 0.85,
  };
  
  const basePrice = cryptoPrices[symbol.toUpperCase()] || (0.1 + (random() * 100));
  
  // Use daily seed for consistent daily changes
  const dailySeed = getDailySeed();
  const dailyRandom = seededRandom(seed + dailySeed);
  const changePercent = (dailyRandom() - 0.5) * 6; // -3% to +3% change
  const change = basePrice * (changePercent / 100);
  
  const symbolUpper = symbol.toUpperCase();
  const nameMap: Record<string, string> = {
    'BITCOIN': 'Bitcoin',
    'ETHEREUM': 'Ethereum',
    'SOLANA': 'Solana',
    'CARDANO': 'Cardano',
    'POLKADOT': 'Polkadot',
    'CHAINLINK': 'Chainlink',
    'AVALANCHE': 'Avalanche',
    'POLYGON': 'Polygon',
  };
  
  return {
    symbol: symbolUpper,
    name: nameMap[symbolUpper] || symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase(),
    type: 'crypto',
    price: Math.round(basePrice * 100) / 100,
    change24h: Math.round(change * 100) / 100,
    changePercent24h: Math.round(changePercent * 100) / 100,
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
  
  // If query is empty, return all popular stocks
  if (!query.trim()) {
    return mockStocks.slice(0, 8).map(symbol => ({
      symbol,
      name: `${symbol} Inc.`,
      type: 'stock' as const,
      price: 0,
      change24h: 0,
      changePercent24h: 0,
    }));
  }
  
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
  
  // If query is empty, return all popular cryptos
  if (!query.trim()) {
    return mockCrypto.slice(0, 8).map(symbol => ({
      symbol: symbol.toUpperCase(),
      name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
      type: 'crypto' as const,
      price: 0,
      change24h: 0,
      changePercent24h: 0,
    }));
  }
  
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

