export type Currency = 'USD' | 'EUR';

const CURRENCY_KEY = 'trading-analyzer-currency';

// Exchange rates (in production, fetch from API)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92, // Approximate EUR/USD rate
};

export function getCurrency(): Currency {
  if (typeof window === 'undefined') return 'USD';
  
  try {
    const stored = localStorage.getItem(CURRENCY_KEY);
    return (stored as Currency) || 'USD';
  } catch {
    return 'USD';
  }
}

export function setCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
  } catch {
    // Ignore errors
  }
}

export function convertPrice(priceUSD: number, currency: Currency): number {
  return priceUSD * EXCHANGE_RATES[currency];
}

export function getCurrencySymbol(currency: Currency): string {
  return currency === 'USD' ? '$' : '€';
}

export function formatPrice(priceUSD: number, currency: Currency): string {
  const convertedPrice = convertPrice(priceUSD, currency);
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${convertedPrice.toFixed(2)}`;
}

