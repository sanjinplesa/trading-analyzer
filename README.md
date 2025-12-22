# Trading Analyzer - Crypto & Stock Analysis Tool

A comprehensive trading analysis application that provides deep market analysis, technical indicators, and trading signals for both stocks and cryptocurrencies.

## Features

- **Watchlist Management**: Add and track multiple stocks and cryptocurrencies
- **Real-time Analysis**: Get instant buy/sell/hold signals with confidence scores
- **Technical Indicators**: 
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - Moving Averages (SMA 20, 50, 200)
  - Bollinger Bands
  - Volume Analysis
- **Probability Analysis**: See the chances of an asset going up or down
- **Price Targets**: Bullish and bearish price targets based on analysis
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## API Integration

Currently, the app uses mock data for demonstration. To integrate real market data:

### For Stocks (Alpha Vantage)

1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Update `lib/api.ts` - replace `fetchStockPrice` function:

```typescript
export async function fetchStockPrice(symbol: string): Promise<Asset> {
  const response = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=YOUR_API_KEY`
  );
  const data = await response.json();
  const quote = data['Global Quote'];
  
  return {
    symbol: quote['01. symbol'],
    name: quote['01. symbol'],
    type: 'stock',
    price: parseFloat(quote['05. price']),
    change24h: parseFloat(quote['09. change']),
    changePercent24h: parseFloat(quote['10. change percent'].replace('%', '')),
  };
}
```

### For Cryptocurrencies (CoinGecko)

1. Update `lib/api.ts` - replace `fetchCryptoPrice` function:

```typescript
export async function fetchCryptoPrice(symbol: string): Promise<Asset> {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true`
  );
  const data = await response.json();
  const priceData = data[symbol.toLowerCase()];
  
  return {
    symbol: symbol.toUpperCase(),
    name: symbol.charAt(0).toUpperCase() + symbol.slice(1),
    type: 'crypto',
    price: priceData.usd,
    change24h: priceData.usd_24h_change || 0,
    changePercent24h: priceData.usd_24h_change || 0,
  };
}
```

### Historical Price Data

For historical data needed for technical analysis, you can use:
- **Stocks**: Alpha Vantage `TIME_SERIES_DAILY` endpoint
- **Crypto**: CoinGecko `market_chart` endpoint

Update the `generateMockPriceHistory` function in `lib/api.ts` to fetch real historical data.

## How It Works

1. **Add Assets**: Search and add stocks or cryptocurrencies to your watchlist
2. **Automatic Analysis**: The app automatically analyzes each asset using multiple technical indicators
3. **Signal Generation**: Based on the indicators, the system generates:
   - **BUY**: Strong bullish signals detected
   - **SELL**: Strong bearish signals detected
   - **HOLD**: Mixed or unclear signals
4. **Probability Scores**: See the probability of price movement up or down
5. **Confidence Level**: Each signal includes a confidence score (0-100%)
6. **Price Targets**: Bullish and bearish price targets based on signal strength

## Technical Indicators Explained

- **RSI**: Measures momentum. Values below 30 suggest oversold (buy), above 70 suggest overbought (sell)
- **MACD**: Shows trend direction and momentum. Positive histogram = bullish, negative = bearish
- **Moving Averages**: Price above SMAs = bullish trend, below = bearish trend
- **Bollinger Bands**: Price near lower band = potential bounce (buy), near upper band = potential pullback (sell)
- **Volume**: High volume confirms price movements

## Disclaimer

This tool is for educational and informational purposes only. Trading involves risk, and past performance does not guarantee future results. Always do your own research and consider consulting with a financial advisor before making investment decisions.

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **technicalindicators** - Technical analysis library
- **Recharts** - Charting library (for future price charts)

## License

MIT
