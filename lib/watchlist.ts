import type { Asset } from './types';

const WATCHLIST_KEY = 'trading-analyzer-watchlist';

export function getWatchlist(): Asset[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(asset: Asset): void {
  if (typeof window === 'undefined') return;
  
  const watchlist = getWatchlist();
  if (!watchlist.find(a => a.symbol === asset.symbol && a.type === asset.type)) {
    watchlist.push(asset);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
}

export function removeFromWatchlist(symbol: string, type: Asset['type']): void {
  if (typeof window === 'undefined') return;
  
  const watchlist = getWatchlist();
  const filtered = watchlist.filter(
    a => !(a.symbol === symbol && a.type === type)
  );
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
}

export function isInWatchlist(symbol: string, type: Asset['type']): boolean {
  const watchlist = getWatchlist();
  return watchlist.some(a => a.symbol === symbol && a.type === type);
}

