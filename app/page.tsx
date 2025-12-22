import { AssetSearch } from '@/components/asset-search';
import { Watchlist } from '@/components/watchlist';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Trading Analyzer</h1>
              <p className="text-muted-foreground mt-2">
                Advanced market analysis with technical indicators and trading signals
              </p>
            </div>
            <AssetSearch />
          </div>
        </div>
        
        <Watchlist />
      </div>
    </div>
  );
}
