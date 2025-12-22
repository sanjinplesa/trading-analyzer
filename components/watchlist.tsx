'use client';

import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWatchlist, removeFromWatchlist } from '@/lib/watchlist';
import { analyzeAsset, fetchStockPrice, fetchCryptoPrice } from '@/lib/api';
import type { Asset, AssetAnalysis } from '@/lib/types';
import { SignalCard } from './signal-card';

export function Watchlist() {
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, AssetAnalysis>>(new Map());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadWatchlist = () => {
    const assets = getWatchlist();
    setWatchlist(assets);
  };

  const analyzeAllAssets = async (refresh = false) => {
    if (watchlist.length === 0) return;
    
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const newAnalyses = new Map<string, AssetAnalysis>();
      
      for (const asset of watchlist) {
        try {
          // Refresh price data
          let updatedAsset: Asset;
          if (asset.type === 'stock') {
            updatedAsset = await fetchStockPrice(asset.symbol);
          } else {
            updatedAsset = await fetchCryptoPrice(asset.symbol);
          }
          
          const analysis = await analyzeAsset(updatedAsset);
          newAnalyses.set(`${asset.symbol}-${asset.type}`, analysis);
        } catch (error) {
          console.error(`Error analyzing ${asset.symbol}:`, error);
        }
      }
      
      setAnalyses(newAnalyses);
    } catch (error) {
      console.error('Error analyzing assets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (watchlist.length > 0) {
      analyzeAllAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist.length]);

  const handleRemove = (symbol: string, type: Asset['type']) => {
    removeFromWatchlist(symbol, type);
    loadWatchlist();
    const key = `${symbol}-${type}`;
    const newAnalyses = new Map(analyses);
    newAnalyses.delete(key);
    setAnalyses(newAnalyses);
  };

  const handleRefresh = () => {
    analyzeAllAssets(true);
  };

  if (watchlist.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Watchlist</CardTitle>
          <CardDescription>
            Add stocks and cryptocurrencies to start analyzing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No assets in watchlist yet. Click &quot;Add Asset&quot; to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Watchlist</h2>
          <p className="text-sm text-muted-foreground">
            {watchlist.length} asset{watchlist.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          variant="outline"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {watchlist.map((asset) => {
          const key = `${asset.symbol}-${asset.type}`;
          const analysis = analyses.get(key);
          
          return (
            <div key={key} className="relative">
              <SignalCard
                analysis={analysis || {
                  asset,
                  signal: {
                    signal: 'HOLD',
                    strength: 0,
                    probability: { up: 50, down: 50 },
                    confidence: 0,
                    reasoning: ['Analysis pending...'],
                    indicators: {
                      rsi: 50,
                      macd: { macd: 0, signal: 0, histogram: 0 },
                      sma20: asset.price,
                      sma50: asset.price,
                      sma200: asset.price,
                      bollingerBands: {
                        upper: asset.price,
                        middle: asset.price,
                        lower: asset.price,
                      },
                      volume: 0,
                    },
                  },
                  priceHistory: [],
                  lastUpdated: new Date(),
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => handleRemove(asset.symbol, asset.type)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

