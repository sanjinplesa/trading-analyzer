'use client';

import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AssetAnalysis } from '@/lib/types';
import { useCurrency } from './currency-provider';
import { formatPrice } from '@/lib/currency';

interface SignalCardProps {
  analysis: AssetAnalysis;
}

export function SignalCard({ analysis }: SignalCardProps) {
  const { asset, signal } = analysis;
  const { currency } = useCurrency();
  const isPositive = asset.changePercent24h >= 0;
  
  const getSignalColor = () => {
    if (signal.signal === 'BUY') return 'bg-green-500';
    if (signal.signal === 'SELL') return 'bg-red-500';
    return 'bg-yellow-500';
  };
  
  const getSignalIcon = () => {
    if (signal.signal === 'BUY') return <TrendingUp className="h-5 w-5" />;
    if (signal.signal === 'SELL') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {asset.symbol}
              <Badge variant={asset.type === 'stock' ? 'default' : 'secondary'}>
                {asset.type}
              </Badge>
            </CardTitle>
            <CardDescription>{asset.name}</CardDescription>
          </div>
          <Badge
            className={`${getSignalColor()} text-white flex items-center gap-1 px-3 py-1`}
          >
            {getSignalIcon()}
            {signal.signal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{formatPrice(asset.price, currency)}</div>
            <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}% (24h)
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
            <div className="text-xl font-semibold">{signal.confidence}%</div>
            <Progress value={signal.confidence} className="h-2 mt-1" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Probability Up</span>
            <span className="font-medium text-green-600">{signal.probability.up}%</span>
          </div>
          <Progress value={signal.probability.up} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Probability Down</span>
            <span className="font-medium text-red-600">{signal.probability.down}%</span>
          </div>
          <Progress value={signal.probability.down} className="h-2" />
        </div>

        {signal.priceTarget && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Bullish Target</div>
              <div className="text-lg font-semibold text-green-600">
                {formatPrice(signal.priceTarget.bullish, currency)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Bearish Target</div>
              <div className="text-lg font-semibold text-red-600">
                {formatPrice(signal.priceTarget.bearish, currency)}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-sm font-medium mb-2 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            Analysis & Guidance
          </div>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {signal.reasoning.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
          <div>
            <div className="text-muted-foreground">RSI</div>
            <div className="font-medium">{signal.indicators.rsi.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">MACD</div>
            <div className="font-medium">{signal.indicators.macd.histogram.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">SMA 20</div>
            <div className="font-medium">{formatPrice(signal.indicators.sma20, currency)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

