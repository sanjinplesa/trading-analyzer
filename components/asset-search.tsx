'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { searchStocks, searchCrypto, fetchStockPrice, fetchCryptoPrice } from '@/lib/api';
import { addToWatchlist, isInWatchlist } from '@/lib/watchlist';
import type { Asset } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export function AssetSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stockResults, setStockResults] = useState<Asset[]>([]);
  const [cryptoResults, setCryptoResults] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = async (query: string, type: 'stock' | 'crypto') => {
    if (!query.trim()) {
      if (type === 'stock') setStockResults([]);
      else setCryptoResults([]);
      return;
    }

    setLoading(true);
    try {
      if (type === 'stock') {
        const results = await searchStocks(query);
        setStockResults(results);
      } else {
        const results = await searchCrypto(query);
        setCryptoResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (asset: Asset) => {
    try {
      let fullAsset: Asset;
      if (asset.type === 'stock') {
        fullAsset = await fetchStockPrice(asset.symbol);
      } else {
        fullAsset = await fetchCryptoPrice(asset.symbol);
      }
      addToWatchlist(fullAsset);
      setOpen(false);
      setSearchQuery('');
      setStockResults([]);
      setCryptoResults([]);
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Asset to Watchlist</DialogTitle>
          <DialogDescription>
            Search for stocks or cryptocurrencies to add to your watchlist
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>
          <TabsContent value="stock" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stocks (e.g., AAPL, GOOGL)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value, 'stock');
                }}
                className="pl-9"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
              {!loading && stockResults.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground">No results found</p>
              )}
              {stockResults.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                >
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  {isInWatchlist(asset.symbol, 'stock') ? (
                    <Badge variant="secondary">Added</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAddAsset(asset)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="crypto" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crypto (e.g., bitcoin, ethereum)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value, 'crypto');
                }}
                className="pl-9"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {loading && <p className="text-sm text-muted-foreground">Searching...</p>}
              {!loading && cryptoResults.length === 0 && searchQuery && (
                <p className="text-sm text-muted-foreground">No results found</p>
              )}
              {cryptoResults.map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                >
                  <div>
                    <div className="font-medium">{asset.symbol}</div>
                    <div className="text-sm text-muted-foreground">{asset.name}</div>
                  </div>
                  {isInWatchlist(asset.symbol, 'crypto') ? (
                    <Badge variant="secondary">Added</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAddAsset(asset)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

