export interface Security {
  id: string;
  symbol: string;
  name: string;
  exchange?: string;
  isin?: string;
  assetClass: string;
  sector?: string;
  industry?: string;
  country?: string;
  marketCapCategory?: string;
  isMutualFund: boolean;
  fundHouse?: string;
  fundCategory?: string;
  expenseRatio?: number;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  updatedAt: Date;
}

export interface PriceHistoryEntry {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
