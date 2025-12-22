'use client';

import { DollarSign } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency, type Currency } from './currency-provider';

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
      <SelectTrigger className="w-[130px]">
        <DollarSign className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">USD ($)</SelectItem>
        <SelectItem value="EUR">EUR (€)</SelectItem>
      </SelectContent>
    </Select>
  );
}

